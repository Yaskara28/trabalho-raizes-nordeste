# API Rede Raízes do Nordeste – Back-end

Versão corrigida do projeto da disciplina Projeto Multidisciplinar – Trilha Back-end.

## 1. Objetivo

A API representa o back-end da rede de lanchonetes Raízes do Nordeste, permitindo o gerenciamento de usuários, produtos, estoque por unidade, pedidos multicanal, pagamentos simulados e fidelidade.

A solução considera os canais:

- APP
- TOTEM
- BALCAO
- PICKUP
- WEB

## 2. Tecnologias

- Node.js
- Express
- PostgreSQL
- JWT
- bcryptjs
- Swagger/OpenAPI
- Postman
- dotenv
- pg

## 3. Requisitos

Instale:

1. Node.js 18 ou superior.
2. PostgreSQL.
3. Postman, para execução dos testes.

## 4. Estrutura

```text
raizes-nordeste-backend/
├── database/
│   ├── schema.sql
│   └── seed.js
├── postman/
│   └── Raizes-do-Nordeste.postman_collection.json
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── swagger.js
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   │   └── Pedido.js
│   └── routes/
├── .env.example
├── package.json
├── README.md
└── server.js
```

## 5. Banco de dados

O DER é representado pelas tabelas:

- usuario
- unidade
- produto
- estoque
- pedido
- item_pedido
- pagamento
- fidelidade

O estoque é separado por unidade. Assim, um mesmo produto pode possuir quantidades diferentes em unidades diferentes.

## 6. Configuração do PostgreSQL

Crie um banco chamado:

```text
raizes_nordeste
```

Depois execute:

```bash
psql -U postgres -d raizes_nordeste -f database/schema.sql
npm run seed
```

Também é possível executar os arquivos pelo pgAdmin usando o Query Tool.

## 7. Configuração do ambiente

Copie `.env.example` para `.env`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/raizes_nordeste
JWT_SECRET=troque_esta_chave_em_ambiente_real
EXPIRES_IN=1h
```

Altere usuário e senha do PostgreSQL conforme a instalação local.

## 8. Instalação

Na pasta do projeto:

```bash
npm install
```

## 9. Execução

Modo desenvolvimento:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

A API ficará disponível em:

```text
http://localhost:3000
```

Teste de saúde:

```text
GET http://localhost:3000/health
```

## 10. Swagger/OpenAPI

A documentação fica disponível em:

```text
http://localhost:3000/api-docs
```

O Swagger deve ser mantido de acordo com os endpoints realmente implementados.

## 11. Autenticação

A autenticação utiliza JWT.

Usuário de teste administrador:

```json
{
  "email": "admin@raizes.com",
  "senha": "123456"
}
```

Usuário de teste cliente:

```json
{
  "email": "cliente@raizes.com",
  "senha": "123456"
}
```

Endpoint:

```text
POST /api/v1/auth/login
```

Após o login, copie o campo `token` e utilize:

```text
Authorization: Bearer SEU_TOKEN
```

## 12. Perfis

Os perfis considerados no domínio são:

- CLIENTE
- ATENDENTE
- COZINHEIRO
- GERENTE
- ADMIN

O middleware JWT verifica o token e, quando necessário, verifica o perfil autorizado.

## 13. Endpoints implementados

### Usuários

`POST /api/v1/usuarios`

Cadastra usuário. A operação é restrita ao perfil ADMIN.

`GET /api/v1/usuarios/{id}`

Consulta dados não sensíveis do usuário.

### Unidades

`GET /api/v1/unidades`

Lista as unidades.

`GET /api/v1/unidades/{id}`

Consulta uma unidade.

### Estoque

`GET /api/v1/estoque?unidadeId=1`

Consulta o estoque, podendo filtrar pela unidade.

### Fidelidade

`GET /api/v1/fidelidade/{clienteId}`

Consulta o saldo de pontos do cliente.

## 13. Endpoints implementados

### Auth

`POST /api/v1/auth/login`

Realiza autenticação e retorna JWT.

### Produtos

`GET /api/v1/produtos?page=1&limit=10`

Lista produtos ativos com paginação.

`GET /api/v1/produtos/{id}`

Consulta um produto específico.

### Pedidos

`POST /api/v1/pedidos`

Cria um pedido.

Exemplo:

```json
{
  "canalPedido": "TOTEM",
  "clienteId": 2,
  "unidadeId": 1,
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2
    }
  ],
  "formaPagamento": "MOCK"
}
```

`GET /api/v1/pedidos`

Lista pedidos.

Exemplo de filtro:

```text
GET /api/v1/pedidos?canalPedido=TOTEM
```

Também é possível filtrar por status:

```text
GET /api/v1/pedidos?status=CONFIRMADO
```

`GET /api/v1/pedidos/{id}`

Consulta pedido e seus itens.

`PATCH /api/v1/pedidos/{id}/status`

Atualiza o status operacional do pedido.

### Pagamento mock

`POST /api/v1/pagamentos/mock`

Simula uma resposta de pagamento.

Header obrigatório:

```text
Idempotency-Key: teste-001
```

Pagamento aprovado:

```json
{
  "pedidoId": 1,
  "valor": 37.00,
  "resultado": "APROVADO"
}
```

Pagamento recusado:

```json
{
  "pedidoId": 1,
  "valor": 37.00,
  "resultado": "RECUSADO"
}
```

## 14. Regras de negócio

### Canal do pedido

O campo `canalPedido` é obrigatório e aceita apenas:

```text
APP
TOTEM
BALCAO
PICKUP
WEB
```

### Estoque

O estoque é controlado por combinação de:

```text
unidade + produto
```

Antes de criar o pedido, a API verifica se existe quantidade suficiente.

Se não existir, retorna:

```text
409 Conflict
```

### Pagamento

O pagamento é simulado.

Quando aprovado:

```text
AGUARDANDO_PAGAMENTO -> CONFIRMADO
```

Quando recusado:

```text
AGUARDANDO_PAGAMENTO -> CANCELADO
```

A baixa de estoque ocorre quando o pagamento é aprovado.

### Idempotência

O pagamento utiliza o header:

```text
Idempotency-Key
```

A chave evita processamento duplicado da mesma solicitação.

## 15. Padrão de erros

Os erros seguem um formato único:

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Pedido não encontrado",
  "path": "/api/v1/pedidos/999",
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

Principais códigos:

- 200 – sucesso
- 201 – recurso criado
- 400 – requisição inválida
- 401 – não autenticado
- 402 – pagamento recusado
- 403 – sem permissão
- 404 – recurso não encontrado
- 409 – conflito/regra de negócio
- 422 – erro de validação

## 16. Segurança e LGPD

A API utiliza:

- autenticação JWT;
- autorização por perfil;
- senha armazenada como hash;
- não exposição do campo `senha_hash` nas respostas;
- minimização de dados pessoais;
- controle de acesso aos recursos protegidos;
- identificação das ações por usuário autenticado.

Dados pessoais considerados no modelo incluem nome, e-mail e CPF.

O uso desses dados deve estar relacionado à finalidade de cadastro, autenticação e funcionamento do serviço.

## 17. Testes Postman

A coleção está em:

```text
postman/Raizes-do-Nordeste.postman_collection.json
```

Cenários previstos:

| ID | Cenário | Resultado |
|---|---|---:|
| T01 | Login válido | 200 |
| T02 | Sem token | 401 |
| T03 | Perfil sem permissão | 403 |
| T04 | Listar produtos | 200 |
| T05 | Criar pedido válido | 201 |
| T06 | Filtrar por canalPedido | 200 |
| T07 | canalPedido ausente | 422 |
| T08 | Quantidade negativa | 400 |
| T09 | Produto inexistente | 404 |
| T10 | Estoque insuficiente | 409 |
| T11 | Pagamento aprovado | 200 |
| T12 | Pagamento recusado | 402 |

## 18. Execução da coleção

1. Inicie o PostgreSQL.
2. Execute `schema.sql`.
3. Execute `seed.sql`.
4. Execute `npm install`.
5. Configure `.env`.
6. Execute `npm run dev`.
7. Abra o Postman.
8. Importe a coleção.
9. Execute T01 primeiro.
10. Utilize o token retornado nos testes protegidos.
11. Execute T05 antes dos testes de pagamento.
12. Confira os status e respostas esperados.

## 19. Relação com o DER

A implementação utiliza as entidades previstas no modelo:

```text
Usuario
Unidade
Produto
Estoque
Pedido
ItemPedido
Pagamento
Fidelidade
```

Principais relacionamentos:

```text
Usuario 1:N Pedido
Usuario 1:1 Fidelidade
Unidade 1:N Estoque
Produto 1:N Estoque
Unidade 1:N Pedido
Pedido 1:N ItemPedido
Produto 1:N ItemPedido
Pedido 1:1 Pagamento
```

## 20. Observação sobre o MVP

O fluxo prioritário é:

```text
Login
  ↓
Criação do pedido
  ↓
Validação do canal
  ↓
Validação do cliente/unidade
  ↓
Validação do estoque
  ↓
Registro do pedido
  ↓
Pagamento mock
  ↓
Aprovado ou recusado
  ↓
Atualização do pedido
  ↓
Baixa do estoque quando aprovado
```

Recursos que não estejam implementados devem ser identificados como evolução futura no documento acadêmico, evitando afirmar que uma funcionalidade existe quando ela não está presente no código.
