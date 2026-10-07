const express = require('express');
const router = express.Router();
const controller = require('../controllers/estoqueController');
const auth = require('../middlewares/authMiddleware');

router.get('/', auth(['ADMIN', 'GERENTE', 'ATENDENTE']), controller.listarEstoque);

module.exports = router;
