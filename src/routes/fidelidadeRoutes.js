const express = require('express');
const router = express.Router();
const controller = require('../controllers/fidelidadeController');
const auth = require('../middlewares/authMiddleware');

router.get('/:clienteId', auth(['CLIENTE', 'ADMIN', 'ATENDENTE']), controller.consultarFidelidade);

module.exports = router;
