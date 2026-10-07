const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuarioController');
const auth = require('../middlewares/authMiddleware');

router.post('/', auth(['ADMIN']), controller.criarUsuario);
router.get('/:id', auth(['ADMIN', 'GERENTE', 'ATENDENTE', 'CLIENTE']), controller.buscarUsuario);

module.exports = router;
