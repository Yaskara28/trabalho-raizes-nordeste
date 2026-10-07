const express = require('express');
const router = express.Router();
const controller = require('../controllers/unidadeController');
const auth = require('../middlewares/authMiddleware');

router.get('/', auth(['ADMIN', 'GERENTE', 'ATENDENTE']), controller.listarUnidades);
router.get('/:id', auth(['ADMIN', 'GERENTE', 'ATENDENTE']), controller.buscarUnidade);

module.exports = router;
