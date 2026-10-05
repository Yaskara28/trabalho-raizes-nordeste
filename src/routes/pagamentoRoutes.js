const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');

router.post('/mock', pagamentoController.processarPagamentoMock);

module.exports = router;