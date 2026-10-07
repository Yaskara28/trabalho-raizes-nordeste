const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post(
  '/mock',
  authMiddleware(['CLIENTE', 'ADMIN', 'ATENDENTE']),
  pagamentoController.processarPagamentoMock
);

module.exports = router;
