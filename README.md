# 🍔 API Rede Raízes do Nordeste - Back-end

API RESTful desenvolvida para o gerenciamento multicanal de pedidos, controle de estoque por unidade e integração simulada de pagamentos para a rede de lanchonetes **Raízes do Nordeste**.

---

## 🚀 Tecnologias e Dependências
- **Linguagem:** Node.js (v18+) / TypeScript (ou Python/Java conforme sua implementação)
- **Framework:** Express / NestJS
- **Banco de Dados:** PostgreSQL
- **ORM:** Prisma / TypeORM / Sequelize
- **Autenticação:** JWT (JSON Web Token) + Bcrypt
- **Documentação:** Swagger (OpenAPI 3.0)

---

## ⚙️ Variáveis de Ambiente (.env)
Crie um arquivo `.env` na raiz do projeto com base no modelo abaixo:

```env
PORT=3000
DATABASE_URL="postgresql://usuario:senha@localhost:5432/raizes_nordeste?schema=public"
JWT_SECRET="chave_secreta_super_segura_raizes_2026"
EXPIRES_IN="8h"