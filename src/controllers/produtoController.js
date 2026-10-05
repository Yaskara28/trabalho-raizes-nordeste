const db = require('../config/database');

exports.listarProdutos = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  return res.status(200).json({
    pagina: page,
    limite: limit,
    total: db.produtos.length,
    dados: db.produtos
  });
};