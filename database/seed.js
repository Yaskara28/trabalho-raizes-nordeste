require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/config/database');

async function seed() {
  const senha = await bcrypt.hash('123456', 10);

  await db.query(`
    INSERT INTO usuario (nome, email, senha_hash, perfil, cpf)
    VALUES
      ('Administrador', 'admin@raizes.com', $1, 'ADMIN', '111.111.111-11'),
      ('Cliente Teste', 'cliente@raizes.com', $1, 'CLIENTE', '222.222.222-22')
    ON CONFLICT (email) DO NOTHING
  `, [senha]);

  await db.query(`
    INSERT INTO unidade (nome, endereco, telefone)
    VALUES ('Unidade Centro', 'Rua Principal, 100 - Centro', '(11) 99999-0000')
    ON CONFLICT DO NOTHING
  `);

  await db.query(`
    INSERT INTO produto (nome, descricao, preco_base, categoria)
    SELECT * FROM (VALUES
      ('Tapioca de Carne Seca', 'Tapioca recheada com carne seca', 18.50, 'Tapioca'),
      ('Cuscuz Nordestino', 'Cuscuz tradicional', 12.00, 'Café da manhã'),
      ('Bolo de Macaxeira', 'Fatia de bolo de macaxeira', 8.50, 'Bolos')
    ) AS v(nome, descricao, preco_base, categoria)
    WHERE NOT EXISTS (SELECT 1 FROM produto LIMIT 1)
  `);

  await db.query(`
    INSERT INTO estoque (unidade_id, produto_id, quantidade_disponivel)
    SELECT 1, id, 50
      FROM produto
    WHERE NOT EXISTS (
      SELECT 1 FROM estoque e
      WHERE e.unidade_id = 1 AND e.produto_id = produto.id
    )
  `);

  await db.query(`
    INSERT INTO fidelidade (cliente_id, saldo_pontos)
    SELECT id, 0
      FROM usuario
     WHERE email = 'cliente@raizes.com'
    ON CONFLICT (cliente_id) DO NOTHING
  `);

  console.log('Seed executado com sucesso.');
  console.log('Admin: admin@raizes.com / 123456');
  console.log('Cliente: cliente@raizes.com / 123456');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Erro no seed:', error);
  process.exit(1);
});
