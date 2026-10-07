DROP TABLE IF EXISTS fidelidade CASCADE;
DROP TABLE IF EXISTS pagamento CASCADE;
DROP TABLE IF EXISTS item_pedido CASCADE;
DROP TABLE IF EXISTS pedido CASCADE;
DROP TABLE IF EXISTS estoque CASCADE;
DROP TABLE IF EXISTS produto CASCADE;
DROP TABLE IF EXISTS unidade CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;

DROP TYPE IF EXISTS perfil_usuario;
DROP TYPE IF EXISTS canal_pedido;
DROP TYPE IF EXISTS status_pedido;
DROP TYPE IF EXISTS status_transacao;

CREATE TYPE perfil_usuario AS ENUM (
  'CLIENTE',
  'ATENDENTE',
  'COZINHEIRO',
  'GERENTE',
  'ADMIN'
);

CREATE TYPE canal_pedido AS ENUM (
  'APP',
  'TOTEM',
  'BALCAO',
  'PICKUP',
  'WEB'
);

CREATE TYPE status_pedido AS ENUM (
  'AGUARDANDO_PAGAMENTO',
  'CONFIRMADO',
  'EM_PREPARACAO',
  'PRONTO',
  'FINALIZADO',
  'CANCELADO'
);

CREATE TYPE status_transacao AS ENUM (
  'PENDENTE',
  'APROVADO',
  'RECUSADO'
);

CREATE TABLE usuario (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil perfil_usuario NOT NULL DEFAULT 'CLIENTE',
  cpf VARCHAR(14),
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE unidade (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  endereco VARCHAR(255) NOT NULL,
  telefone VARCHAR(30),
  ativa BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE produto (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  descricao TEXT,
  preco_base NUMERIC(10,2) NOT NULL CHECK (preco_base >= 0),
  categoria VARCHAR(80),
  ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE estoque (
  id SERIAL PRIMARY KEY,
  unidade_id INTEGER NOT NULL REFERENCES unidade(id),
  produto_id INTEGER NOT NULL REFERENCES produto(id),
  quantidade_disponivel INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_disponivel >= 0),
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (unidade_id, produto_id)
);

CREATE TABLE pedido (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES usuario(id),
  unidade_id INTEGER NOT NULL REFERENCES unidade(id),
  canal_pedido canal_pedido NOT NULL,
  status status_pedido NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
  valor_total NUMERIC(10,2) NOT NULL CHECK (valor_total >= 0),
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE item_pedido (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES produto(id),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario NUMERIC(10,2) NOT NULL CHECK (preco_unitario >= 0),
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0)
);

CREATE TABLE pagamento (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL UNIQUE REFERENCES pedido(id) ON DELETE CASCADE,
  metodo_pagamento VARCHAR(50) NOT NULL,
  status_transacao status_transacao NOT NULL DEFAULT 'PENDENTE',
  idempotency_key VARCHAR(120),
  processado_em TIMESTAMP
);

CREATE TABLE fidelidade (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL UNIQUE REFERENCES usuario(id) ON DELETE CASCADE,
  saldo_pontos INTEGER NOT NULL DEFAULT 0 CHECK (saldo_pontos >= 0),
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pedido_canal ON pedido(canal_pedido);
CREATE INDEX idx_pedido_status ON pedido(status);
CREATE INDEX idx_estoque_unidade_produto ON estoque(unidade_id, produto_id);
