const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

exports.login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      const error = new Error('Email e senha são obrigatórios');
      error.statusCode = 400;
      throw error;
    }

    const result = await db.query(
      'SELECT id, nome, email, senha_hash, perfil FROM usuario WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      const error = new Error('Credenciais inválidas');
      error.statusCode = 401;
      throw error;
    }

    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      const error = new Error('Credenciais inválidas');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.perfil },
      process.env.JWT_SECRET || 'troque-esta-chave',
      { expiresIn: process.env.EXPIRES_IN || '1h' }
    );

    return res.status(200).json({
      token,
      tipo: 'Bearer',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.perfil
      }
    });
  } catch (err) {
    next(err);
  }
};
