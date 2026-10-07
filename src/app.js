const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const pagamentoRoutes = require('./routes/pagamentoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const unidadeRoutes = require('./routes/unidadeRoutes');
const estoqueRoutes = require('./routes/estoqueRoutes');
const fidelidadeRoutes = require('./routes/fidelidadeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/produtos', produtoRoutes);
app.use('/api/v1/pedidos', pedidoRoutes);
app.use('/api/v1/pagamentos', pagamentoRoutes);
app.use('/api/v1/usuarios', usuarioRoutes);
app.use('/api/v1/unidades', unidadeRoutes);
app.use('/api/v1/estoque', estoqueRoutes);
app.use('/api/v1/fidelidade', fidelidadeRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

module.exports = app;
