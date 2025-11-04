const  { prisma } = require('../database');
const { buildWhere } = require('../utils');
const QuoteRepository = require('./QuoteRepository');
const RequisitionItemRepository = require('./RequisitionItemRepository');
class QuoteItemRepository {
  include() {
    return {
      produtos: true,
      WEB_REQUISICAO_ITEMS: {
        include: {
          produtos: true,
        },
      },
    };
  }

  format(item) {
    const formattedItem = {
      ...item,
      produto: item.WEB_REQUISICAO_ITEMS?.produtos,
      produto_descricao: item.WEB_REQUISICAO_ITEMS?.produtos?.descricao,
      observacao: item.WEB_REQUISICAO_ITEMS?.observacao,
      produto_codigo: item.WEB_REQUISICAO_ITEMS?.produtos?.codigo,
      produto_unidade: item.WEB_REQUISICAO_ITEMS?.produtos?.unidade,
    };
    if (item.WEB_REQUISICAO_ITEMS?.produtos?.descricao === 'MATERIAL OU SERVIÇO NÃO CADASTRADO') {
      formattedItem.produto_descricao = item.WEB_REQUISICAO_ITEMS?.observacao || item.WEB_REQUISICAO_ITEMS?.produtos?.descricao
    }
    delete formattedItem.produtos;
    delete formattedItem.WEB_REQUISICAO_ITEMS;
    return formattedItem;
  }

  async getMany(params, searchTerm) {
    if (params.id_cotacao) {
      params.id_cotacao = parseInt(params.id_cotacao);
    }

    const generalFilters = {
      OR: [
        {
          WEB_REQUISICAO_ITEMS: {
            produtos: { descricao: { contains: searchTerm } },
          },
        },
        {
          WEB_REQUISICAO_ITEMS: {
            produtos: { codigo: { contains: searchTerm } },
          },
        },
        {
          WEB_REQUISICAO_ITEMS: {
            produtos: { unidade: { contains: searchTerm } },
          },
        },
        { observacao: { contains: searchTerm } },
      ],
    };
    return prisma.web_items_cotacao
      .findMany({
        where: {
          ...params,
          ...generalFilters,
        },
        include: this.include(),
      })
      .then((items) => items.map((item) => this.format(item)));
  }

  async getById(id_item_cotacao) {
    return await prisma.web_items_cotacao
      .findUnique({
        where: { id_item_cotacao: Number(id_item_cotacao) },
        include: this.include(),
      })
      .then((item) => this.format(item));
  }

  async create(payload) {
    return await prisma.web_items_cotacao.create({
      data: payload,
    });
  }

  async createMany(payload) {
    return await prisma.web_items_cotacao.createMany({
      data: payload,
    });
  }

  async update(id_item_cotacao, payload) {
    return await prisma.web_items_cotacao
      .update({
        where: { id_item_cotacao: Number(id_item_cotacao) },
        data: payload,
        include: this.include(),
      })
      .then((item) => this.format(item));
  }

  async delete(id_item_cotacao) {
    return await prisma.web_items_cotacao.delete({
      where: { id_item_cotacao: Number(id_item_cotacao) },
    });
  }

  async getQuoteItemsSelectedInRequisition(id_cotacao) {
    const quote = await QuoteRepository.getById(Number(id_cotacao));
    const reqItems = await RequisitionItemRepository.getMany({
      id_requisicao: Number(quote.id_requisicao),
    });
    const quoteItemsIds = reqItems.map((item) => Number(item.id_item_cotacao));
    //busca todos os itens da cotação que estão selecionados na requisição
    const quoteItemsSelected = await this.getMany({
      id_item_cotacao: { in: quoteItemsIds },
      id_cotacao: Number(id_cotacao),
    });
    return quoteItemsSelected;
  }
}

module.exports = new QuoteItemRepository();