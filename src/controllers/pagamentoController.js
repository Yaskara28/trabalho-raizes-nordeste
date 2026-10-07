const db = require('../config/database');

exports.processarPagamentoMock = async (req, res, next) => {
  const client = await db.getClient();

  try {
    const { pedidoId, valor, resultado = 'APROVADO' } = req.body;
    const idempotencyKey = req.headers['idempotency-key'];

    if (!pedidoId || valor === undefined) {
      const error = new Error('pedidoId e valor são obrigatórios');
      error.statusCode = 400;
      throw error;
    }

    if (!idempotencyKey) {
      const error = new Error('Header Idempotency-Key é obrigatório');
      error.statusCode = 422;
      throw error;
    }

    if (!['APROVADO', 'RECUSADO'].includes(resultado)) {
      const error = new Error('resultado deve ser APROVADO ou RECUSADO');
      error.statusCode = 422;
      throw error;
    }

    await client.query('BEGIN');

    const pedido = await client.query(
      `SELECT id, status, valor_total
         FROM pedido
        WHERE id = $1
        FOR UPDATE`,
      [pedidoId]
    );

    if (pedido.rows.length === 0) {
      const error = new Error('Pedido não encontrado');
      error.statusCode = 404;
      throw error;
    }

    const dadosPedido = pedido.rows[0];

    const existente = await client.query(
      `SELECT id, status_transacao AS status, idempotency_key AS "idempotencyKey"
         FROM pagamento
        WHERE pedido_id = $1
          AND idempotency_key = $2`,
      [pedidoId, idempotencyKey]
    );

    if (existente.rows.length > 0) {
      await client.query('COMMIT');
      return res.status(200).json(existente.rows[0]);
    }

    const novoStatusPagamento = resultado === 'APROVADO'
      ? 'APROVADO'
      : 'RECUSADO';

    const novoStatusPedido = resultado === 'APROVADO'
      ? 'CONFIRMADO'
      : 'CANCELADO';

    const pagamento = await client.query(
      `UPDATE pagamento
          SET status_transacao = $1,
              idempotency_key = $2,
              processado_em = NOW()
        WHERE pedido_id = $3
        RETURNING id,
                  pedido_id AS "pedidoId",
                  metodo_pagamento AS "metodoPagamento",
                  status_transacao AS status,
                  idempotency_key AS "idempotencyKey",
                  processado_em AS "processadoEm"`,
      [novoStatusPagamento, idempotencyKey, pedidoId]
    );

    if (pagamento.rows.length === 0) {
      const error = new Error('Registro de pagamento do pedido não encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (resultado === 'APROVADO') {
      const itens = await client.query(
        `SELECT produto_id, quantidade
           FROM item_pedido
          WHERE pedido_id = $1`,
        [pedidoId]
      );

      for (const item of itens.rows) {
        await client.query(
          `UPDATE estoque e
              SET quantidade_disponivel =
                    quantidade_disponivel - $1,
                  atualizado_em = NOW()
             FROM pedido p
            WHERE p.id = $2
              AND e.produto_id = $3
              AND e.unidade_id = p.unidade_id`,
          [item.quantidade, pedidoId, item.produto_id]
        );
      }

      await client.query(
        `UPDATE pedido SET status = $1 WHERE id = $2`,
        [novoStatusPedido, pedidoId]
      );
    } else {
      await client.query(
        `UPDATE pedido SET status = $1 WHERE id = $2`,
        [novoStatusPedido, pedidoId]
      );
    }

    await client.query('COMMIT');

    return res.status(resultado === 'APROVADO' ? 200 : 402).json({
      ...pagamento.rows[0],
      pedidoStatus: novoStatusPedido,
      valor: Number(dadosPedido.valor_total)
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};
