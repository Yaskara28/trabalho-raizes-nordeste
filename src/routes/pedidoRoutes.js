const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware(['CLIENTE', 'ADMIN', 'ATENDENTE']), pedidoController.criarPedido);
router.get('/', authMiddleware(['ADMIN', 'GERENTE']), pedidoController.listarPedidos);

module.exports = router;