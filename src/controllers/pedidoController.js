const db = require('../config/database');

const CANAIS_VALIDOS = ['TOTEM', 'APP', 'BALCAO', 'PICKUP', 'WEB'];

exports.criarPedido = (req, res, next) => {
  try {
    const { canalPedido, clienteId, itens, formaPagamento } = req.body;

    // Validação obrigatória do canalPedido (Conforme item 5.5 do Roteiro)
    if (!canalPedido || !CANAIS_VALIDOS.includes(canalPedido)) {
      const error = new Error(`O campo 'canalPedido' é obrigatório e deve ser um dos seguintes: ${CANAIS_VALIDOS.join(', ')}`);
      error.statusCode = 422;
      throw error;
    }

    if (!clienteId || !itens || itens.length === 0) {
      const error = new Error("Dados de pedido incompletos (clienteId e itens são obrigatórios)");
      error.statusCode = 400;
      throw error;
    }

    const novoPedido = {
      id: db.pedidos.length + 1,
      canalPedido,
      clienteId,
      itens,
      formaPagamento: formaPagamento || "MOCK",
      status: "AGUARDANDO_PAGAMENTO",
      criadoEm: new Date().toISOString()
    };

    db.pedidos.push(novoPedido);

    return res.status(201).json(novoPedido);
  } catch (err) {
    next(err);
  }
};

exports.listarPedidos = (req, res) => {
  const { canalPedido, status } = req.query;
  let resultado = db.pedidos;

  if (canalPedido) {
    resultado = resultado.filter(p => p.canalPedido === canalPedido);
  }
  if (status) {
    resultado = resultado.filter(p => p.status === status);
  }

  return res.status(200).json(resultado);
};