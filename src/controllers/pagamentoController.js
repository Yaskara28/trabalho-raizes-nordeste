const db = require('../config/database');

exports.processarPagamentoMock = (req, res, next) => {
  try {
    const { pedidoId, valor } = req.body;

    const pedido = db.pedidos.find(p => p.id === parseInt(pedidoId));
    if (!pedido) {
      const error = new Error("Pedido não encontrado");
      error.statusCode = 404;
      throw error;
    }

    pedido.status = "PAGO";

    const comprovante = {
      transacaoId: "MOCK-" + Date.now(),
      pedidoId,
      valor,
      status: "APROVADO",
      dataHora: new Date().toISOString()
    };

    db.pagamentos.push(comprovante);

    return res.status(200).json(comprovante);
  } catch (err) {
    next(err);
  }
};