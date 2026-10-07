const CANAIS_VALIDOS = ['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB'];
const STATUS_VALIDOS = [
  'AGUARDANDO_PAGAMENTO',
  'CONFIRMADO',
  'EM_PREPARACAO',
  'PRONTO',
  'FINALIZADO',
  'CANCELADO'
];

class Pedido {
  constructor({
    id = null,
    clienteId,
    unidadeId,
    canalPedido,
    status = 'AGUARDANDO_PAGAMENTO',
    valorTotal = 0,
    criadoEm = null,
    itens = []
  }) {
    this.id = id;
    this.clienteId = clienteId;
    this.unidadeId = unidadeId;
    this.canalPedido = canalPedido;
    this.status = status;
    this.valorTotal = Number(valorTotal);
    this.criadoEm = criadoEm;
    this.itens = itens;
  }

  validar() {
    if (!this.clienteId) {
      throw new Error('clienteId é obrigatório');
    }

    if (!this.unidadeId) {
      throw new Error('unidadeId é obrigatório');
    }

    if (!CANAIS_VALIDOS.includes(this.canalPedido)) {
      throw new Error(
        `canalPedido inválido. Valores permitidos: ${CANAIS_VALIDOS.join(', ')}`
      );
    }

    if (!STATUS_VALIDOS.includes(this.status)) {
      throw new Error(
        `status inválido. Valores permitidos: ${STATUS_VALIDOS.join(', ')}`
      );
    }

    if (!Array.isArray(this.itens) || this.itens.length === 0) {
      throw new Error('O pedido deve possuir pelo menos um item');
    }

    this.itens.forEach((item) => {
      if (!item.produtoId || !Number.isInteger(Number(item.quantidade)) || Number(item.quantidade) <= 0) {
        throw new Error('Cada item deve possuir produtoId e quantidade inteira maior que zero');
      }
    });

    return true;
  }

  calcularTotal() {
    this.valorTotal = this.itens.reduce((total, item) => {
      const subtotal = Number(item.precoUnitario || 0) * Number(item.quantidade);
      return total + subtotal;
    }, 0);

    return Number(this.valorTotal.toFixed(2));
  }

  podeCancelar() {
    return ['AGUARDANDO_PAGAMENTO', 'CONFIRMADO'].includes(this.status);
  }
}

Pedido.CANAIS_VALIDOS = CANAIS_VALIDOS;
Pedido.STATUS_VALIDOS = STATUS_VALIDOS;

module.exports = Pedido;
