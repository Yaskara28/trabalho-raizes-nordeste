const jwt = require('jsonwebtoken');

exports.login = (req, res, next) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      const error = new Error("Email e senha são obrigatórios");
      error.statusCode = 400;
      throw error;
    }

    // Simulação de login válido
    const token = jwt.sign(
      { id: 1, email, role: 'ADMIN' },
      process.env.JWT_SECRET || 'secreta_raizes_nordeste_123',
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      token,
      tipo: "Bearer",
      usuario: { id: 1, email, role: "ADMIN" }
    });
  } catch (err) {
    next(err);
  }
};