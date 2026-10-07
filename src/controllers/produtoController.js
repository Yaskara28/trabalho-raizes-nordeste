const db = require('../config/database');

exports.listarProdutos = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const count = await db.query(
      'SELECT COUNT(*)::int AS total FROM produto WHERE ativo = TRUE'
    );

    const result = await db.query(
      `SELECT id, nome, descricao, preco_base AS "precoBase",
              categoria, ativo
         FROM produto
        WHERE ativo = TRUE
        ORDER BY id
        LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return res.status(200).json({
      pagina: page,
      limite: limit,
      total: count.rows[0].total,
      dados: result.rows
    });
  } catch (err) {
    next(err);
  }
};

exports.buscarProduto = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, nome, descricao, preco_base AS "precoBase",
              categoria, ativo
         FROM produto
        WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      const error = new Error('Produto não encontrado');
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
