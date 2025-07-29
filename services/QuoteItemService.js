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
    data.subtotal = this.calculateSubTotal(data);
    await this.calculateTotal(id_item_cotacao, data);
    const updatedItem = await QuoteItemRepository.update(id_item_cotacao, data);

    return updatedItem;
  }

  calculateSubTotal(data) {
    if (data.indisponivel) {
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
  async calculateTotal(id_item_cotacao, item) {
    try {
      // Validar entrada
      if (!id_item_cotacao || !item?.id_cotacao) {
        return;
      }
      // Buscar itens da cotaç o
      const quoteItems = await this.getMany({ id_cotacao: item.id_cotacao });
      // Calcular total antes da atualização
      const totalBeforeUpdate = quoteItems.reduce(
        (acc, curr) => acc + Number(curr.subtotal || 0),
        0
      );
      // Atualizar item especifico
      const updatedItems = quoteItems.map((quoteItem) =>
        quoteItem.id_item_cotacao === Number(id_item_cotacao) ? item : quoteItem
      );
      // Calcular novo total
      const newTotal = updatedItems.reduce(
        (acc, curr) => acc + Number(curr.subtotal || 0),
        0
      );
      // Retornar se n o houver mudado o total
      if (totalBeforeUpdate === newTotal) {
        return;
      }
      // Buscar cotação
      const quote = await QuoteRepository.getById(item.id_cotacao);
      const requsiton = await RequisitionRepository.findById(
        Number(quote.id_requisicao)
      );
      const reqItem = await RequisitionItemRepository.getById(
        Number(item.id_item_requisicao)
      );

      if (!quote) {
        throw new Error(`Cotação não encontrada para id: ${item.id_cotacao}`);
      }
      // Calcular diferença
      const difference = Math.abs(newTotal - totalBeforeUpdate);
      const isIncreasing = newTotal > totalBeforeUpdate;

      //se o item de cotação estiver no item de requisição, atualiza o custo total dos itens, se não apenas atualiza o total da cotação
      if (Number(reqItem.id_item_cotacao) === Number(id_item_cotacao)) {
        const newRequisitionTotal = isIncreasing
          ? Number(requsiton.custo_total_itens) + difference
          : Number(requsiton.custo_total_itens) - difference;
        requsiton.custo_total_itens = newRequisitionTotal;
        await RequisitionRepository.update(Number(requsiton.ID_REQUISICAO), {
          custo_total_itens: newRequisitionTotal,
        });
      }
      //calcula novo valor total da cotação
      const newQuoteTotal = isIncreasing
        ? Number(quote.valor_total) + difference
        : Number(quote.valor_total) - difference;
      // Atualizar cotação
      await QuoteRepository.update(quote.id_cotacao, {
        valor_total: newQuoteTotal,
      });

      return { success: true, newTotal: newQuoteTotal };
    } catch (error) {
      console.error("Erro ao calcular total:", error.message);
      throw error;
    }
  }

  async delete(id_item_cotacao) {
    await this.subtractItemValueFromTotal(id_item_cotacao);
    return QuoteItemRepository.delete(id_item_cotacao);
  }

  async subtractItemValueFromTotal(id_item_cotacao) {
    const item = await this.getById(id_item_cotacao);
    const quote = await QuoteRepository.getById(item.id_cotacao);
    const newTotal = Number(quote.valor_total) - Number(item.subtotal);
    const reqItemRelated = await RequisitionItemRepository.getById(Number(item.id_item_requisicao));
    const requisiton = await RequisitionRepository.findById(
      Number(quote.id_requisicao)
    );
    const quoteItemIsSelected = Number(reqItemRelated.id_item_cotacao) === Number(item.id_item_cotacao)

    if (requisiton.custo_total_itens > 0 && quoteItemIsSelected) {
      requisiton.custo_total_itens = Number(requisiton.custo_total_itens) - Number(item.subtotal);
      await RequisitionRepository.update(Number(requisiton.ID_REQUISICAO), {
        custo_total_itens: Number(requisiton.custo_total_itens),
      });
    }
    await QuoteRepository.update(quote.id_cotacao, { valor_total: newTotal });
  }

  async addItemValueToTotal(id_item_cotacao) {
    const item = await this.getById(id_item_cotacao);
    const quote = await QuoteRepository.getById(item.id_cotacao);
    const newTotal = Number(quote.valor_total) + Number(item.subtotal);
    ;
    ;
    // await QuoteRepository.update(quote.id_cotacao, { valor_total: newTotal });
  }

   calculateTotalFromSelectedQuoteItems(quoteItems){ 
     if(!quoteItems.length > 0) { return 0; }
     return quoteItems.reduce(
       (acc, curr) => acc + Number(curr.subtotal || 0),
       0
     );
  }
}

module.exports = new QuoteItemService();