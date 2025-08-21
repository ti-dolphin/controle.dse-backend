const { prisma } = require("../database");
const QuoteItemRepository = require("../repositories/QuoteItemRepository");
const QuoteRepository = require("../repositories/QuoteRepository");
const RequisitionItemRepository = require("../repositories/RequisitionItemRepository");
const RequisitionRepository = require("../repositories/RequisitionRepository");
const RequisitionUtils = require("../utils/RequisitionUtils");
const updateRequisitionWithNewTotals  = require("../utils/RequisitionUtils");

class QuoteItemService {
  async getMany(params, searchTerm) {
    return QuoteItemRepository.getMany(params, searchTerm);
  }

  async getById(id_item_cotacao) {
    return QuoteItemRepository.getById(id_item_cotacao);
  }

  async create(data) {
    return QuoteItemRepository.create(data);
  }

  async createMany(data) {
    await QuoteItemRepository.createMany(data);
    return await this.getMany({ id_cotacao: data[0].id_cotacao });
  }

  async update(id_item_cotacao, data) {
    return await prisma.$transaction(async (tx) => {
      data.subtotal = await this.calculateSubTotal(id_item_cotacao, data);
      await this.calculateItemsTotal(id_item_cotacao, data);
      const updatedItem = await tx.web_items_cotacao.update({
        where: { id_item_cotacao: Number(id_item_cotacao) },
        data,
        include: QuoteItemRepository.include(),
      }).then((item) => QuoteItemRepository.format(item));
      const req = await tx.web_requisicao.findFirst({
        where: {
          web_requisicao_items: {
            some: {
              id_item_requisicao: Number(updatedItem.id_item_requisicao),
            },
          },
        },
        include: {
          web_requisicao_items: true,
        },
      });
      await RequisitionUtils.updateRequisitionWithNewTotals(
        req.ID_REQUISICAO,
        req.web_requisicao_items,
        tx
      );
      return updatedItem;
    });
  }

  async calculateSubTotal(id_item_cotacao, data) {
    if (data.indisponivel) {
      await this.subtractQuoteItemFromRequisition(id_item_cotacao);
      return 0;
    }
    const precoUnitario = Number(data.preco_unitario);
    const quantidadeCotada = Number(data.quantidade_cotada);
    const IPI = Number(data.IPI) / 100;
    const ST = Number(data.ST) / 100;
    const subtotal = precoUnitario * quantidadeCotada * (1 + IPI + ST);
    return subtotal.toFixed(2);
  }
  //calcula o novo total da cotação e da requisição de acordo com o item atualizado
  async calculateItemsTotal(id_item_cotacao, item) {
    try {
      // Validar entrada
      if (!id_item_cotacao || !item?.id_cotacao) {
        return;
      }
      // Buscar cotação
      const quote = await QuoteRepository.getById(item.id_cotacao);
      const quoteItems = await this.getMany({ id_cotacao: item.id_cotacao });
      // Calcular total antes da atualização
      const itemsTotalBefore = quote.valor_total_itens;
      // Atualizar item especifico
      const updatedItems = quoteItems.map((quoteItem) =>
        quoteItem.id_item_cotacao === Number(id_item_cotacao) ? item : quoteItem
      );
      // Calcular novo total
      const newTotal = updatedItems.reduce(
        (acc, curr) => acc + Number(curr.subtotal || 0),
        0
      );
      if (itemsTotalBefore === newTotal) {
        return;
      }
      const updatedQuote = await QuoteRepository.update(quote.id_cotacao, {
        valor_total_itens: newTotal,
      });

      return { success: true, newTotal: updatedQuote };
    } catch (error) {
      console.error("Erro ao calcular total:", error.message);
      throw error;
    }
  }

  async delete(id_item_cotacao) {
    await this.subtractQuoteItemFromRequisition(id_item_cotacao);
    return QuoteItemRepository.delete(id_item_cotacao);
  }

  async subtractQuoteItemFromRequisition(id_item_cotacao) {
    const item = await this.getById(id_item_cotacao);
    const quote = await QuoteRepository.getById(item.id_cotacao);
    const newTotal = Number(quote.valor_total_itens) - Number(item.subtotal);
    const reqItemRelated = await RequisitionItemRepository.getById(
      Number(item.id_item_requisicao)
    );
    const requisiton = await RequisitionRepository.findById(
      Number(quote.id_requisicao)
    );
    const quoteItemIsSelected =
      Number(reqItemRelated.id_item_cotacao) === Number(item.id_item_cotacao);

    if (requisiton.custo_total_itens > 0 && quoteItemIsSelected) {
      requisiton.custo_total_itens =
        Number(requisiton.custo_total_itens) - Number(item.subtotal);
      await RequisitionRepository.update(Number(requisiton.ID_REQUISICAO), {
        custo_total_itens: Number(requisiton.custo_total_itens),
      });
      //desmarcando item da cotação da seleção
      await RequisitionItemRepository.update(
        Number(reqItemRelated.id_item_requisicao),
        {
          id_item_cotacao: null,
        }
      );
    }
    await QuoteRepository.update(quote.id_cotacao, {
      valor_total_itens: newTotal,
    });
  }

  async addItemValueToTotal(id_item_cotacao) {
    const item = await this.getById(id_item_cotacao);
    const quote = await QuoteRepository.getById(item.id_cotacao);
    const newTotal = Number(quote.valor_total) + Number(item.subtotal);
    // await QuoteRepository.update(quote.id_cotacao, { valor_total: newTotal });
  }

  calculateTotalFromSelectedQuoteItems(quoteItems) {
    if (!quoteItems.length > 0) {
      return 0;
    }
    return quoteItems.reduce(
      (acc, curr) => acc + Number(curr.subtotal || 0),
      0
    );
  }

  async cloneQuoteItems(
    quoteItems,
    newQuoteByOldQuoteId,
    oldReqItemToNewId,
    tx
  ) {
    const oldQuoteItemToNewId = new Map();
    const newQuoteItems = [];

    for (const [oldQuoteId, newQuoteId] of newQuoteByOldQuoteId) {
      const oldQuoteItems = quoteItems.filter(
        (item) => item.id_cotacao === oldQuoteId
      );
      if (oldQuoteItems.length) {
        for (const oldItem of oldQuoteItems) {
          const { id_item_cotacao, id_cotacao, ...rest } = oldItem;
          const newReqItemId = oldReqItemToNewId.get(
            oldItem.id_item_requisicao
          );
          const newQuoteItem = await tx.web_items_cotacao.create({
            data: {
              ...rest,
              id_cotacao: newQuoteId,
              id_item_requisicao: newReqItemId || null,
            },
          });

          oldQuoteItemToNewId.set(
            id_item_cotacao,
            newQuoteItem.id_item_cotacao
          );
          newQuoteItems.push(newQuoteItem);
        }
      }
    }
    return { oldQuoteItemToNewId };
  }

  async updateQuoteItemQuantities(quoteItems, requisitionItems, tx) {
    const reqItemToQuoteItemsMap = new Map();
    const reqItemIdToReqItem = new Map();

    requisitionItems.forEach((item) => {
      reqItemIdToReqItem.set(item.id_item_requisicao, item);
    });

    const reqId = requisitionItems[0].id_requisicao;

    const quotes = await tx.web_cotacao.findMany({
      where: { id_requisicao: reqId },
    });

    // Map requisition items to their corresponding quote items
    for (const item of requisitionItems) {
      const relatedQuoteItems = quoteItems.filter(
        (quoteItem) => quoteItem.id_item_requisicao === item.id_item_requisicao
      );
      if (relatedQuoteItems.length > 0) {
        reqItemToQuoteItemsMap.set(item.id_item_requisicao, relatedQuoteItems);
      }
    }

    const updatedQuoteItems = [];

    // Use a for...of loop for asynchronous updates
    for (const [
      reqItemId,
      relatedQuoteItems,
    ] of reqItemToQuoteItemsMap.entries()) {
      for (const quoteItem of relatedQuoteItems) {
        const reqItem = reqItemIdToReqItem.get(reqItemId);
        const updatedQuoteItem = await tx.web_items_cotacao.update({
          where: { id_item_cotacao: quoteItem.id_item_cotacao },
          data: {
            quantidade_cotada: reqItem.quantidade,
            quantidade_solicitada: reqItem.quantidade,
            subtotal: quoteItem.preco_unitario * reqItem.quantidade,
          },
        });
        updatedQuoteItems.push(updatedQuoteItem);
      }
    }

    for (let quote of quotes) {
      const itemsSum = updatedQuoteItems
        .filter((item) => item.id_cotacao === quote.id_cotacao)
        .reduce((acc, curr) => acc + Number(curr.subtotal || 0), 0);
      console.log(
        `atualizando cotação ${quote.id_cotacao} com valor total itens ${itemsSum}`
      );
      await tx.web_cotacao.update({
        where: { id_cotacao: quote.id_cotacao },
        data: {
          valor_total_itens: itemsSum,
        },
      });
    }

    return updatedQuoteItems;
  }
}

module.exports = new QuoteItemService();
