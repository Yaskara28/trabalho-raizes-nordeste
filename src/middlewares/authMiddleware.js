const jwt = require('jsonwebtoken');

const authMiddleware = (rolesPermitidas = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Token de autenticação não fornecido',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'troque-esta-chave'
      );

      req.usuario = decoded;

      if (
        rolesPermitidas.length > 0 &&
        !rolesPermitidas.includes(decoded.role)
      ) {
        return res.status(403).json({
          status: 'error',
          statusCode: 403,
          message: 'Acesso negado: perfil sem permissão para este recurso',
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Token inválido ou expirado',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  };
};

module.exports = authMiddleware;
