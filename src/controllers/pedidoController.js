const db = require('../config/database');
const Pedido = require('../models/Pedido');

exports.criarPedido = async (req, res, next) => {
  const client = await db.getClient();

  try {
    const {
      canalPedido,
      clienteId,
      unidadeId,
      itens,
      formaPagamento = 'MOCK'
    } = req.body;

    const pedido = new Pedido({
      clienteId,
      unidadeId,
      canalPedido,
      itens: Array.isArray(itens) ? itens : []
    });

    try {
      pedido.validar();
    } catch (validationError) {
      validationError.statusCode = validationError.message.includes('canalPedido')
        ? 422
        : 400;
      throw validationError;
    }

    await client.query('BEGIN');

    const cliente = await client.query(
      'SELECT id FROM usuario WHERE id = $1 AND perfil = $2',
      [clienteId, 'CLIENTE']
    );

    if (cliente.rows.length === 0) {
      const error = new Error('Cliente não encontrado');
      error.statusCode = 404;
      throw error;
    }

    const unidade = await client.query(
      'SELECT id FROM unidade WHERE id = $1 AND ativa = TRUE',
      [unidadeId]
    );

    if (unidade.rows.length === 0) {
      const error = new Error('Unidade não encontrada ou inativa');
      error.statusCode = 404;
      throw error;
    }

    const itensProcessados = [];
    let valorTotal = 0;

    for (const item of itens) {
      const produto = await client.query(
        `SELECT p.id, p.nome, p.preco_base,
                e.quantidade_disponivel
           FROM produto p
           JOIN estoque e
             ON e.produto_id = p.id
            AND e.unidade_id = $2
          WHERE p.id = $1
            AND p.ativo = TRUE
          FOR UPDATE`,
        [item.produtoId, unidadeId]
      );

      if (produto.rows.length === 0) {
        const error = new Error(
          `Produto ${item.produtoId} não encontrado na unidade informada`
        );
        error.statusCode = 404;
        throw error;
      }

      const dadosProduto = produto.rows[0];
      const quantidade = Number(item.quantidade);

      if (dadosProduto.quantidade_disponivel < quantidade) {
        const error = new Error(
          `Estoque insuficiente para o produto ${dadosProduto.nome}`
        );
        error.statusCode = 409;
        throw error;
      }

      const precoUnitario = Number(dadosProduto.preco_base);
      const subtotal = Number((precoUnitario * quantidade).toFixed(2));

      valorTotal += subtotal;

      itensProcessados.push({
        produtoId: dadosProduto.id,
        nome: dadosProduto.nome,
        quantidade,
        precoUnitario,
        subtotal
      });
    }

    const pedidoResult = await client.query(
      `INSERT INTO pedido
        (cliente_id, unidade_id, canal_pedido, status, valor_total)
       VALUES ($1, $2, $3, 'AGUARDANDO_PAGAMENTO', $4)
       RETURNING id, cliente_id AS "clienteId",
                 unidade_id AS "unidadeId",
                 canal_pedido AS "canalPedido",
                 status, valor_total AS "valorTotal", criado_em AS "criadoEm"`,
      [clienteId, unidadeId, canalPedido, valorTotal]
    );

    const novoPedido = pedidoResult.rows[0];

    for (const item of itensProcessados) {
      await client.query(
        `INSERT INTO item_pedido
          (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          novoPedido.id,
          item.produtoId,
          item.quantidade,
          item.precoUnitario,
          item.subtotal
        ]
      );
    }

    await client.query(
      `INSERT INTO pagamento
        (pedido_id, metodo_pagamento, status_transacao)
       VALUES ($1, $2, 'PENDENTE')`,
      [novoPedido.id, formaPagamento]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      ...novoPedido,
      formaPagamento,
      itens: itensProcessados
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.listarPedidos = async (req, res, next) => {
  try {
    const { canalPedido, status } = req.query;
    const params = [];
    const filtros = [];

    if (canalPedido) {
      params.push(canalPedido);
      filtros.push(`p.canal_pedido = $${params.length}`);
    }

    if (status) {
      params.push(status);
      filtros.push(`p.status = $${params.length}`);
    }

    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

    const result = await db.query(
      `SELECT p.id,
              p.cliente_id AS "clienteId",
              p.unidade_id AS "unidadeId",
              p.canal_pedido AS "canalPedido",
              p.status,
              p.valor_total AS "valorTotal",
              p.criado_em AS "criadoEm"
         FROM pedido p
         ${where}
        ORDER BY p.id DESC`,
      params
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.buscarPedido = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT p.id,
              p.cliente_id AS "clienteId",
              p.unidade_id AS "unidadeId",
              p.canal_pedido AS "canalPedido",
              p.status,
              p.valor_total AS "valorTotal",
              p.criado_em AS "criadoEm"
         FROM pedido p
        WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Pedido não encontrado');
      error.statusCode = 404;
      throw error;
    }

    const itens = await db.query(
      `SELECT ip.produto_id AS "produtoId",
              pr.nome,
              ip.quantidade,
              ip.preco_unitario AS "precoUnitario",
              ip.subtotal
         FROM item_pedido ip
         JOIN produto pr ON pr.id = ip.produto_id
        WHERE ip.pedido_id = $1
        ORDER BY ip.id`,
      [req.params.id]
    );

    return res.status(200).json({
      ...result.rows[0],
      itens: itens.rows
    });
  } catch (err) {
    next(err);
  }
};

exports.atualizarStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!Pedido.STATUS_VALIDOS.includes(status)) {
      const error = new Error('Status de pedido inválido');
      error.statusCode = 422;
      throw error;
    }

    const result = await db.query(
      `UPDATE pedido
          SET status = $1
        WHERE id = $2
        RETURNING id, status`,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Pedido não encontrado');
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
