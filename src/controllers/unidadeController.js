const db = require('../config/database');

exports.listarUnidades = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, nome, endereco, telefone, ativa
         FROM unidade
        ORDER BY id`
    );
    res.status(200).json(result.rows);
  } catch (err) { next(err); }
};

exports.buscarUnidade = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, nome, endereco, telefone, ativa
         FROM unidade
        WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) {
      const e = new Error('Unidade não encontrada');
      e.statusCode = 404;
      throw e;
    }
    res.status(200).json(result.rows[0]);
  } catch (err) { next(err); }
};
