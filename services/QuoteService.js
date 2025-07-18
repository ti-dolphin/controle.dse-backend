const QuoteItemRepository = require("../repositories/QuoteItemRepository");
const QuoteRepository = require("../repositories/QuoteRepository");
const RequisitionItemRepository = require("../repositories/RequisitionItemRepository");
const RequisitionRepository = require("../repositories/RequisitionRepository");
const QuoteItemService = require("./QuoteItemService");
const RequisitionService = require("./RequisitionService");
class QuoteService {
  async getMany(params) {
    return await QuoteRepository.getMany(params);
  }

  async getById(id_cotacao) {
    return await QuoteRepository.getById(id_cotacao);
  }

  async getTaxClassifications() {
    return await QuoteRepository.getTaxClassifications();
  }

  async getPaymentConditions() {
    return await QuoteRepository.getPaymentConditions();
  }

  async getShipmentTypes() {
    return await QuoteRepository.getShipmentTypes();
  }

  async create(data) {
    const { itemIds } = data;
    delete data.itemIds;
    const quote = await QuoteRepository.create(data);
    if(data.id_requisicao){ 
        const reqItems = await RequisitionItemRepository.getMany({ id_item_requisicao : {in : itemIds} });
        for (const reqItem of reqItems) {
          await QuoteItemRepository.create({
            id_cotacao: quote.id_cotacao,
            id_item_requisicao: reqItem.id_item_requisicao,
            quantidade_solicitada: reqItem.quantidade,
            quantidade_cotada: reqItem.quantidade,
            descricao_item: "",
            preco_unitario: 0,
          });
        }
    }
    return quote;
  }

  async update(id_cotacao, data) {
    try {
      // veirifica se o valor do frete mudou, se houver mudado, atualiza o valor total de acordo com a diferença
      if (data.valor_frete !== undefined) {
        const quote = await this.getById(id_cotacao);
        data.valor_total = await this.setUpdatedShippingCostOnRequisition(quote, data);
      }
      return await QuoteRepository.update(id_cotacao, data);
    } catch (e) {
      console.error("Error in update:", e.message);
      throw e;
    }
  }

  async setUpdatedShippingCostOnRequisition(oldQuote, newQuote){

    const { id_requisicao, valor_total, valor_frete, id_cotacao } = oldQuote;
    const new_valor_frete = Number(newQuote.valor_frete || 0);

    const difference = Number(new_valor_frete) - Number(valor_frete);
    const selectedQuoteItems = await QuoteItemRepository.getQuoteItemsSelectedInRequisition(id_cotacao);

    console.log("selectedQuoteItems: ", selectedQuoteItems);

    let quoteTotal = 0;
    if(!selectedQuoteItems.length > 0){ 
      //atualiza valor na requisição apenas se houver items daquela cotação selecionados
      quoteTotal = Number(valor_total) + difference;
      return quoteTotal;
    }
    const requisition = await RequisitionRepository.findById(
      Number(id_requisicao)
    );

    const custo_total_frete = Number(requisition.custo_total_frete) + difference;
    await RequisitionService.update(Number(id_requisicao), {
      custo_total_frete,
    });
    quoteTotal = Number(valor_total) + difference;
    return quoteTotal;
  }

  async delete(id_cotacao) {
      const quote = await this.getById(id_cotacao);
      const requisition = await RequisitionRepository.findById(Number(quote.id_requisicao));
      const quoteItemsSelected = await QuoteItemRepository.getQuoteItemsSelectedInRequisition(id_cotacao);
      const totalFromSelectedQuoteItems = QuoteItemService.calculateTotalFromSelectedQuoteItems(quoteItemsSelected);
      if(!quoteItemsSelected.length) { //se não houver nenhum item da cotação selecionado, exclui a cotação
        return await QuoteRepository.delete(id_cotacao);
      }
    //calcula o total dos itens selecionados
    const newRequisitionItemsTotal = Number(requisition.custo_total_itens) - totalFromSelectedQuoteItems;
    //calcula o novo total do frete, que deverá subtrair o frete da cotação excluída
    const newShippingCost = Number(requisition.custo_total_frete) - Number(quote.valor_frete);

    await RequisitionService.update(Number(quote.id_requisicao), {
      custo_total_itens: newRequisitionItemsTotal,
      custo_total_frete: newShippingCost,
    });
    return await QuoteRepository.delete(Number(id_cotacao));
  }

  //funções auxiliares


}

module.exports = new QuoteService();