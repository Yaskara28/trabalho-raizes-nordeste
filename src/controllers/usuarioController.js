const bcrypt = require('bcryptjs');
const db = require('../config/database');

exports.criarUsuario = async (req, res, next) => {
  try {
    const { nome, email, senha, perfil = 'CLIENTE', cpf } = req.body;

    if (!nome || !email || !senha) {
      const e = new Error('nome, email e senha são obrigatórios');
      e.statusCode = 400;
      throw e;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await db.query(
      `INSERT INTO usuario (nome, email, senha_hash, perfil, cpf)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, email, perfil, cpf, criado_em AS "criadoEm"`,
      [nome, email, senhaHash, perfil, cpf || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      err.statusCode = 409;
      err.message = 'Email já cadastrado';
    }
    next(err);
  }
};

exports.buscarUsuario = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, nome, email, perfil, cpf, criado_em AS "criadoEm"
         FROM usuario
        WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) {
      const e = new Error('Usuário não encontrado');
      e.statusCode = 404;
      throw e;
    }
    res.status(200).json(result.rows[0]);
  } catch (err) { next(err); }
};
