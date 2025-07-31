const QuoteItemRepository = require('../repositories/QuoteItemRepository');
const QuoteRepository = require('../repositories/QuoteRepository');
const RequisitionItemRepository = require('../repositories/RequisitionItemRepository');
const RequisitionRepository = require('../repositories/RequisitionRepository');

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
    data.subtotal = await this.calculateSubTotal(id_item_cotacao, data);
    await this.calculateItemsTotal(id_item_cotacao, data);
    const updatedItem = await QuoteItemRepository.update(id_item_cotacao, data);
    return updatedItem;
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
    console.log("id_item_cotacao", id_item_cotacao);
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
}

module.exports = new QuoteItemService();