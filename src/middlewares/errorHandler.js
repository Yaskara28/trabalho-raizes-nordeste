const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    status: "error",
    statusCode: statusCode,
    message: err.message || "Erro interno do servidor",
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;