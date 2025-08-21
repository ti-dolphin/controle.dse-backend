const { prisma } = require("../database");
const QuoteItemRepository = require("../repositories/QuoteItemRepository");
const QuoteRepository = require("../repositories/QuoteRepository");
const RequisitionItemRepository = require("../repositories/RequisitionItemRepository");
const RequisitionRepository = require("../repositories/RequisitionRepository");
const RequisitionItemService = require("./RequisitionItemService");
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
    if (data.id_requisicao) {
      const reqItems = await RequisitionItemRepository.getMany({
        id_item_requisicao: { in: itemIds },
      });
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
        data.valor_frete = Number(data.valor_frete);
        await this.setUpdatedShippingCostOnRequisition(quote, data);
      }
      delete data.valor_total;
      return await QuoteRepository.update(id_cotacao, data);
    } catch (e) {
      console.error("Error in update:", e.message);
      throw e;
    }
  }

  async setUpdatedShippingCostOnRequisition(oldQuote, newQuote) {
    const { id_requisicao, valor_total, valor_frete, id_cotacao } = oldQuote;
    const new_valor_frete = Number(newQuote.valor_frete || 0);

    const difference = Number(new_valor_frete) - Number(valor_frete);
    const selectedQuoteItems =
      await QuoteItemRepository.getQuoteItemsSelectedInRequisition(id_cotacao);

    let quoteTotal = 0;
    if (!selectedQuoteItems.length > 0) {
      //atualiza valor na requisição apenas se houver items daquela cotação selecionados
      quoteTotal = Number(valor_total) + difference;
      return quoteTotal;
    }
    const requisition = await RequisitionRepository.findById(
      Number(id_requisicao)
    );
    const custo_total_frete =
      Number(requisition.custo_total_frete) + difference;
    await prisma.web_requisicao.update({
      where: { ID_REQUISICAO: Number(id_requisicao) },
      data: { custo_total_frete },
    });
    quoteTotal = Number(valor_total) + difference;
    return quoteTotal;
  }

  async delete(id_cotacao) {
    return await prisma.$transaction(async (tx) => {
      const quote = await tx.web_cotacao.findUnique({ where: { id_cotacao } });
      if (!quote || !quote.id_requisicao) {
        throw new Error("Quote or associated requisition not found.");
      }
      const quoteItems = await tx.web_items_cotacao.findMany({
        where: { id_cotacao },
      });
      //items da requsição que tem items cotados
      const quotedReqItems = await tx.web_requisicao_items.findMany({
        where: { id_item_cotacao: { in: quoteItems.map((item) => item.id_item_cotacao) } },
      });
      for (const item of quotedReqItems) {
          await tx.web_requisicao_items.update({ 
          where: { id_item_requisicao: item.id_item_requisicao },
          data: { id_item_cotacao: null },
        });
      }
      const updatedReqItems = await tx.web_requisicao_items.findMany({
        where: {id_requisicao: quote.id_requisicao},
      })
      await RequisitionItemService.updateRequisitionWithNewTotals(
        quote.id_requisicao,
        updatedReqItems,
        tx
      );
      await QuoteRepository.delete(id_cotacao);
      return true;
    });
  }

  async cloneQuotes(oldRequisitionId, newRequisitionId, tx) {
    const quotes = await tx.web_cotacao.findMany({
      where: { id_requisicao: oldRequisitionId },
    });
    const newQuoteByOldQuoteId = new Map();
    for (const quote of quotes) {
      const { id_cotacao, valor_total, ...rest } = quote;
      const newQuote = await tx.web_cotacao.create({
        data: {
          ...rest,
          id_requisicao: newRequisitionId,
        },
      });
      newQuoteByOldQuoteId.set(id_cotacao, newQuote.id_cotacao);
    }
    const quoteItems = await tx.web_items_cotacao.findMany({
      where: { id_cotacao: { in: quotes.map((q) => q.id_cotacao) } },
    });
    return { newQuoteByOldQuoteId, quoteItems };
  }

  async calculateItemsTotal() {}

  //funções auxiliares
}

module.exports = new QuoteService();
