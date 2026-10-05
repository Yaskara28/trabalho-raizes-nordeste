// Simulação de base de dados em memória
const db = {
  usuarios: [],
  produtos: [
    { id: 10, nome: "Tapioca de Carne Seca", preco: 18.50, estoque: 50 }
  ],
  pedidos: [],
  pagamentos: []
};

module.exports = db;