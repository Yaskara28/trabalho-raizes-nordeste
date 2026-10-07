const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Raízes do Nordeste',
      version: '2.0.0',
      description: 'API REST para pedidos multicanal, produtos, estoque, unidades, fidelidade e pagamento mock.'
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    paths: {
      '/api/v1/auth/login': {
        post: {
          summary: 'Realizar login',
          requestBody: { required: true, content: {'application/json': {schema: {type:'object', required:['email','senha'], properties:{email:{type:'string'},senha:{type:'string'}}}}}},
          responses: {'200': {description:'Login realizado'}, '400': {description:'Dados obrigatórios'}, '401': {description:'Credenciais inválidas'}}
        }
      },
      '/api/v1/usuarios': {
        post: {
          security:[{bearerAuth:[]}], summary:'Cadastrar usuário',
          responses:{'201':{description:'Usuário criado'},'400':{description:'Validação'},'403':{description:'Sem permissão'}}
        }
      },
      '/api/v1/unidades': {
        get: {security:[{bearerAuth:[]}],summary:'Listar unidades',responses:{'200':{description:'Lista de unidades'}}}
      },
      '/api/v1/produtos': {
        get: {summary:'Listar produtos',parameters:[{name:'page',in:'query',schema:{type:'integer'}},{name:'limit',in:'query',schema:{type:'integer'}}],responses:{'200':{description:'Lista paginada'}}}
      },
      '/api/v1/estoque': {
        get: {security:[{bearerAuth:[]}],summary:'Consultar estoque',parameters:[{name:'unidadeId',in:'query',schema:{type:'integer'}}],responses:{'200':{description:'Estoque'}}}
      },
      '/api/v1/pedidos': {
        post: {security:[{bearerAuth:[]}],summary:'Criar pedido',responses:{'201':{description:'Pedido criado'},'400':{description:'Validação'},'401':{description:'Sem token'},'409':{description:'Estoque insuficiente'},'422':{description:'canalPedido inválido'}}},
        get: {security:[{bearerAuth:[]}],summary:'Listar pedidos',parameters:[{name:'canalPedido',in:'query',schema:{type:'string'}},{name:'status',in:'query',schema:{type:'string'}}],responses:{'200':{description:'Pedidos'}}}
      },
      '/api/v1/pedidos/{id}': {
        get:{security:[{bearerAuth:[]}],summary:'Consultar pedido',parameters:[{name:'id',in:'path',required:true,schema:{type:'integer'}}],responses:{'200':{description:'Pedido'},'404':{description:'Não encontrado'}}}
      },
      '/api/v1/pedidos/{id}/status': {
        patch:{security:[{bearerAuth:[]}],summary:'Atualizar status',parameters:[{name:'id',in:'path',required:true,schema:{type:'integer'}}],responses:{'200':{description:'Status atualizado'},'404':{description:'Não encontrado'},'422':{description:'Status inválido'}}}
      },
      '/api/v1/pagamentos/mock': {
        post:{security:[{bearerAuth:[]}],summary:'Processar pagamento mock',parameters:[{name:'Idempotency-Key',in:'header',required:true,schema:{type:'string'}}],responses:{'200':{description:'Pagamento aprovado'},'402':{description:'Pagamento recusado'},'404':{description:'Pedido não encontrado'}}}
      },
      '/api/v1/fidelidade/{clienteId}': {
        get:{security:[{bearerAuth:[]}],summary:'Consultar fidelidade',parameters:[{name:'clienteId',in:'path',required:true,schema:{type:'integer'}}],responses:{'200':{description:'Saldo de pontos'},'404':{description:'Não encontrado'}}}
      }
    }
  },
  apis: []
};

module.exports = swaggerJsdoc(options);
