const db = require('../config/database');

exports.consultarFidelidade = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT f.id,
              f.cliente_id AS "clienteId",
              f.saldo_pontos AS "saldoPontos",
              f.atualizado_em AS "atualizadoEm"
         FROM fidelidade f
        WHERE f.cliente_id = $1`,
      [req.params.clienteId]
    );

    if (!result.rows.length) {
      const e = new Error('Cadastro de fidelidade não encontrado');
      e.statusCode = 404;
      throw e;
    }

    res.status(200).json(result.rows[0]);
  } catch (err) { next(err); }
};
