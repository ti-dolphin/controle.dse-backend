const QuoteRepository = require("../repositories/QuoteRepository");
const RequisitionItemRepository = require("../repositories/RequisitionItemRepository");
const QuoteItemService = require("./QuoteItemService");
const RequisitionRepository = require("../repositories/RequisitionRepository");
const RequisitionService = require("./RequisitionService");
const QuoteService = require("./QuoteService");
class RequisitionItemService {
  async getMany(params, searchTerm) {
    const reqItems = await RequisitionItemRepository.getMany(
      params,
      searchTerm
    );
    return reqItems;
  }

  async getDinamicColumns(id_requisicao) {
    const quotesByrequisicao = await QuoteRepository.getQuotesByRequisition(
      id_requisicao
    );
    const columns = quotesByrequisicao.map((quote) => ({
      headerName: quote.fornecedor,
      field: String(quote.id_cotacao),
      flex: 0.6,
      editable: false,
    }));
    return columns;
  }

  async getById(id) {
    return await RequisitionItemRepository.getById(id);
  }

  async create(data) {
    return await RequisitionItemRepository.create(data);
  }

  async createMany(payload) {
    const newItems = await RequisitionItemRepository.createMany(payload);
    return newItems.map((item) => item.id_item_requisicao);
  }

  async update(id_item_requisicao, data) {
    data.oc = Number(data.oc);
    return await RequisitionItemRepository.update(id_item_requisicao, data);
  }

  async updateShippingDate(ids, date) {
    return await RequisitionItemRepository.updateShippingDate(ids, date);
  }
  async updateOCS(ids, oc) {
    return await RequisitionItemRepository.updateOCS(ids, oc);
  }
  //atualiza a relação de items da reuquisição com itens da cotação selecionados
  async updateQuoteItemsSelected(id_requisicao, quoteItemsSelectedMap) {
    const requisitionItems = await this.getMany({ id_requisicao });
    const updatedItems = [];
    for (const reqItem of requisitionItems) {
      const id_item_cotacao = quoteItemsSelectedMap[reqItem.id_item_requisicao]
        ? Number(quoteItemsSelectedMap[reqItem.id_item_requisicao])
        : null;
      const updatedItem = await RequisitionItemRepository.update(
        reqItem.id_item_requisicao,
        { id_item_cotacao }
      );
      updatedItems.push(updatedItem);
    }
    const quoteItems = await this.calculateItemsTotal(
      updatedItems,
      id_requisicao
    );
    const updatedRequisition = await this.calculateShippingTotal(
      quoteItems,
      id_requisicao
    );
    const custo_total =
      Number(updatedRequisition.custo_total_itens) +
      Number(updatedRequisition.custo_total_frete);
    updatedRequisition.custo_total = custo_total;

    return { updatedItems, updatedRequisition };
  }

  async calculateItemsTotal(items, id_requisicao) {
    if (!items.length > 0) return;
    const quoteItemIdList = items.map((item) => Number(item.id_item_cotacao));
    //lista de cotações selecionadas atualizada
    const quoteItems = await QuoteItemService.getMany({
      id_item_cotacao: { in: quoteItemIdList },
    });
    if (!quoteItems.length > 0) {
      //se nenhum item de cotação estiver selecionado --> atualiza o custo total dos itens para zero
      await RequisitionRepository.update(Number(id_requisicao), {
        custo_total_itens: 0,
      });
      return quoteItems;
    }
    //soma dos subtotais dos itens de cotação selecionados
    const subtotals = quoteItems.map((item) => Number(item.subtotal) || 0);
    const itemsTotal = subtotals.reduce((acc, curr) => acc + Number(curr || 0));
    await RequisitionRepository.update(Number(id_requisicao), {
      custo_total_itens: itemsTotal,
    });
    return quoteItems;
  }

  async calculateShippingTotal(quoteItems, id_requisicao) {
    //calcula o custo total de frete, somando o frete de cada cotação inclusa nos itens de cotação selecionados
    if (!quoteItems.length > 0) {
      //se não houver nenhum item de cotação selecionado --> atualiza o custo total de frete para zero
      const updatedRequisition = await RequisitionRepository.update(
        Number(id_requisicao),
        { custo_total_frete: 0 }
      );
      return updatedRequisition;
    }
    const quoteIdList = quoteItems.map((item) => Number(item.id_cotacao));
    const quotesInQuoteItemList = await QuoteRepository.getMany({
      id_cotacao: { in: quoteIdList },
    });
    const shippingTotal = quotesInQuoteItemList
      .map((quote) => Number(quote.valor_frete) || 0)
      .reduce((acc, curr) => acc + Number(curr || 0));
    const updatedRequisition = await RequisitionRepository.update(
      Number(id_requisicao),
      { custo_total_frete: shippingTotal }
    );
    return updatedRequisition;
  }

  async requisitionHasOnlyOneItem(id_requisicao) {
    const requisitionItems = await this.getMany({ id_requisicao });
    return requisitionItems.length === 1;
  }

  async delete(id_item_requisicao) {
    const reqItem = await this.getById(id_item_requisicao);
    const matchingQuoteItems = await QuoteItemService.getMany({
      id_item_requisicao: id_item_requisicao,
    });
    const { id_requisicao } = reqItem;

    //se houver itens de cotação relacionados ao item de requisição, exclui os itens de cotação
    if (matchingQuoteItems.length > 0) {
      for (const quoteItem of matchingQuoteItems) {
        await QuoteItemService.delete(quoteItem.id_item_cotacao);
        const onlyOneItem = await this.requisitionHasOnlyOneItem(id_requisicao);
        if (onlyOneItem) {
          await QuoteService.update(Number(quoteItem.id_cotacao), {
            valor_total: 0
          });
          await RequisitionService.update(Number(id_requisicao), {
            custo_total_itens: 0,
            custo_total_frete: 0,
          });
        }
      }
    }
    return await RequisitionItemRepository.delete(id_item_requisicao);
  }
}

module.exports = new RequisitionItemService();
