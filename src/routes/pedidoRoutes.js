const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post(
  '/',
  authMiddleware(['CLIENTE', 'ADMIN', 'ATENDENTE']),
  pedidoController.criarPedido
);

router.get(
  '/',
  authMiddleware(['ADMIN', 'GERENTE', 'ATENDENTE']),
  pedidoController.listarPedidos
);

router.get(
  '/:id',
  authMiddleware(['ADMIN', 'GERENTE', 'ATENDENTE', 'CLIENTE']),
  pedidoController.buscarPedido
);

router.patch(
  '/:id/status',
  authMiddleware(['ADMIN', 'GERENTE', 'ATENDENTE']),
  pedidoController.atualizarStatus
);

module.exports = router;
