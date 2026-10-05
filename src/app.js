const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const pagamentoRoutes = require('./routes/pagamentoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/auth', authRoutes);
app.use('/produtos', produtoRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/pagamentos', pagamentoRoutes);

// Middleware Global de Tratamento de Erro (Regra 5.4 / Checklist 5.3)
app.use(errorHandler);

module.exports = app;