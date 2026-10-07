const db = require('../config/database');

exports.listarEstoque = async (req, res, next) => {
  try {
    const params = [];
    let where = '';

    if (req.query.unidadeId) {
      params.push(req.query.unidadeId);
      where = 'WHERE e.unidade_id = $1';
    }

    const result = await db.query(
      `SELECT e.id,
              e.unidade_id AS "unidadeId",
              e.produto_id AS "produtoId",
              p.nome AS "produtoNome",
              e.quantidade_disponivel AS "quantidadeDisponivel",
              e.atualizado_em AS "atualizadoEm"
         FROM estoque e
         JOIN produto p ON p.id = e.produto_id
         ${where}
        ORDER BY e.id`,
      params
    );
    res.status(200).json(result.rows);
  } catch (err) { next(err); }
};
