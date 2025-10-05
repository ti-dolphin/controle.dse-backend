class RequisitionUtils {
  async updateRequisitionWithNewTotals(requisitionId, requisitionItems, tx) {
    if (requisitionItems && requisitionItems.length) {
      // Extract quote item IDs
      const quoteItemIds = requisitionItems
        .map((item) => item.id_item_cotacao)
        .filter(Boolean);

      // Fetch quote items from the database
      const quoteItemsSelected = await tx.web_items_cotacao.findMany({
        where: {
          id_item_cotacao: {
            in: quoteItemIds,
          },
        },
      });

      // Calculate item totals
      const itemsTotal = await this.calculateItemsTotal(
        quoteItemsSelected,
        requisitionItems,
        tx
      );

      // Calculate shipping totals
      const shippingTotal = await this.calculateShippingTotal(
        quoteItemsSelected,
        requisitionId,
        tx
      );

      console.log(
        `Custo total da requisição ${requisitionId}: ${itemsTotal + shippingTotal}`
      );

      return {
        itemsTotal,
        shippingTotal,
      };
    }
  }

  async calculateItemsTotal(quoteItemsSelected, requisitionItems, tx) {
    const requisitionId = requisitionItems[0].id_requisicao;
    if (!quoteItemsSelected || !quoteItemsSelected.length) {
      await tx.wEB_REQUISICAO.update({
        where: { ID_REQUISICAO: Number(requisitionId) },
        data: { custo_total_itens: 0 },
      });
      return 0;
    }

    const quoteItemIDtoReqItem = new Map();
    quoteItemsSelected.forEach((quoteItem) => {
      const reqItem = requisitionItems.find(
        (item) => item.id_item_cotacao === quoteItem.id_item_cotacao
      );
      if (reqItem) {
        quoteItemIDtoReqItem.set(quoteItem.id_item_cotacao, reqItem);
      }
    });

    let itemsTotal = 0;
    quoteItemsSelected.forEach((quoteItem) => {
      const reqItem = quoteItemIDtoReqItem.get(quoteItem.id_item_cotacao);
      if (reqItem) {
        itemsTotal += Number(quoteItem.preco_unitario) * reqItem.quantidade;
      }
    });

    await tx.wEB_REQUISICAO.update({
      where: { ID_REQUISICAO: Number(requisitionId) },
      data: { custo_total_itens: itemsTotal },
    });

    return itemsTotal;
  }

  async calculateShippingTotal(quoteItemsSelected, id_requisicao, tx) {
    if (!quoteItemsSelected || !quoteItemsSelected.length) {
      await tx.wEB_REQUISICAO.update({
        where: { ID_REQUISICAO: Number(id_requisicao) },
        data: { custo_total_frete: 0 },
      });
      return 0;
    }

    const quoteIdList = quoteItemsSelected.map((item) => item.id_cotacao);
    const quotesInQuoteItemList = await tx.web_cotacao.findMany({
      where: { id_cotacao: { in: quoteIdList } },
    });

    const shippingTotal = quotesInQuoteItemList
      .map((quote) => Number(quote.valor_frete) || 0)
      .reduce((acc, curr) => acc + curr, 0);

    await tx.wEB_REQUISICAO.update({
      where: { ID_REQUISICAO: Number(id_requisicao) },
      data: { custo_total_frete: shippingTotal },
    });

    return shippingTotal || 0;
  }
}

module.exports = new RequisitionUtils();


