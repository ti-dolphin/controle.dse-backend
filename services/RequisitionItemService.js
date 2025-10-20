const QuoteRepository = require("../repositories/QuoteRepository");
const RequisitionItemRepository = require("../repositories/RequisitionItemRepository");
const QuoteItemService = require("./QuoteItemService");
const RequisitionRepository = require("../repositories/RequisitionRepository");
const RequisitionService = require("./RequisitionService");
const QuoteService = require("./QuoteService");
const { prisma } = require("../database");
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
    try{ 
        const { updatedItems, updatedRequisition } = await prisma.$transaction(
          async (tx) => {
            const requisitionItems = await tx.wEB_REQUISICAO_ITEMS.findMany({
              where: { 
                id_requisicao: Number(id_requisicao),
                ativo: 1
              },
            });
            const updatedItems = [];
            for (const reqItem of requisitionItems) {
              const id_item_cotacao = quoteItemsSelectedMap[
                reqItem.id_item_requisicao
              ]
                ? Number(quoteItemsSelectedMap[reqItem.id_item_requisicao])
                : null;

              const updatedItem = await tx.wEB_REQUISICAO_ITEMS.update({
                  where: { id_item_requisicao: reqItem.id_item_requisicao },
                  data: { id_item_cotacao },
                  include: RequisitionItemRepository.include()
                })
                .then((result) => RequisitionItemRepository.format(result));
              updatedItems.push(updatedItem);
            }
            const { shippingTotal, itemsTotal } = await this.updateRequisitionWithNewTotals(
                id_requisicao,
                updatedItems,
                tx
              );
            const updatedRequisition = await tx.wEB_REQUISICAO
              .findUnique({
                where: { ID_REQUISICAO: Number(id_requisicao) },
                include: RequisitionRepository.buildInclude(),
              }).then((result) => RequisitionRepository.formatRequisition(result));
            updatedRequisition.custo_total =  Number(updatedRequisition.custo_total_itens) + shippingTotal;
            return { updatedItems, updatedRequisition };
          }
        );
        return { updatedItems, updatedRequisition };
    }catch(e){ 
      console.log(e);
      return null;
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

  async requisitionHasOnlyOneItem(id_requisicao) {
    // Busca todos os itens (ativos e inativos) para verificar se é o último item ativo
    const allItems = await RequisitionItemRepository.getAll({ id_requisicao });
    const activeItems = allItems.filter(item => item.ativo === 1);
    return activeItems.length === 1;
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
            valor_total: 0,
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

  async distributeQuantities(originalItems, childItems, tx) {
    const updates = [];
    const updatedOriginalItems = [];

    for (const item of originalItems) {
      const childReqItem = childItems.find(
        (i) => i.id_item_requisicao === item.id_item_requisicao
      );
      if (!childReqItem) {
        updatedOriginalItems.push(item);
        continue;
      }
      const newQty = Number(item.quantidade) - Number(childReqItem.quantidade);
      if (newQty === 0) {
        updates.push(
          tx.wEB_REQUISICAO_ITEMS.update({
            where: { id_item_requisicao: item.id_item_requisicao },
            data: { ativo: 0 },
          })
        );
        continue;
      }
      const updatedItem = await tx.wEB_REQUISICAO_ITEMS.update({
        where: { id_item_requisicao: item.id_item_requisicao },
        data: { quantidade: newQty },
      });
      updatedOriginalItems.push(updatedItem);
    }
    await Promise.all(updates);
    return updatedOriginalItems;
  }

  async crateAttachment(data){ 
     return prisma.web_anexos_item_requisicao.create({data});
  }

  async createChildItems(items, newRequisitionId, tx) {
    const oldReqItemToNewId = new Map();
    const newReqItems = [];

    for (const item of items) {
      const {
        id_item_requisicao,
        produto,
        produto_descricao,
        produto_codigo,
        produto_unidade,
        produto_quantidade_estoque,
        produto_quantidade_disponivel,
        items_cotacao,
        anexos,
        ...rest
      } = item;

      const attachments = await tx.web_anexos_item_requisicao.findMany({ 
        where: { 
          id_item_requisicao : item.id_item_requisicao
        }
      });
      const newItem = await tx.wEB_REQUISICAO_ITEMS.create({
        data: {
          ...rest,
          quantidade: Number(rest.quantidade),
          id_requisicao: newRequisitionId,
        },
      });

      for(const attachment of attachments){
        const {id_anexo_item_requisicao, id_item_requisicao, ...rest} = attachment;
        await tx.web_anexos_item_requisicao.create({
          data: {
            ...rest,
            id_item_requisicao: newItem.id_item_requisicao
          }
        })
      }

      oldReqItemToNewId.set(id_item_requisicao, newItem.id_item_requisicao);
      newReqItems.push(newItem);
    }
    return { oldReqItemToNewId, newReqItems };
  }

  async updateQuoteItemIds(newReqItems, oldQuoteItemToNewId, tx) {
    const updatedItems = [];

    for (const newItem of newReqItems) {
      if (!newItem.id_item_cotacao) {
        updatedItems.push(newItem);
        continue;
      }
      const newCotId = oldQuoteItemToNewId.get(newItem.id_item_cotacao);
      if (newCotId) {
        const updatedItem = await tx.wEB_REQUISICAO_ITEMS.update({
          where: { id_item_requisicao: newItem.id_item_requisicao },
          data: { id_item_cotacao: newCotId },
        });
        updatedItems.push(updatedItem);
        continue;
      }
      console.warn(
        `Aviso: id_item_cotacao ${newItem.id_item_cotacao} não mapeado para novo ID.`
      );
    }

    await Promise.all(updatedItems);
    return updatedItems;
  }

  async updateRequisitionWithNewTotals(requisitionId, requisitionItems, tx) {
    if (requisitionItems && requisitionItems.length) {
      // Extract quote item IDs
      const quoteItemIds = requisitionItems
        .map((item) => item.id_item_cotacao)
        .filter(Boolean);
      //atualizar as cotações sem itens selecionados
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
      console.log(`Custo total da requisição ${requisitionId}: ${itemsTotal + shippingTotal}`);
      return {
        itemsTotal,
        shippingTotal,
      };
    }
  }
}

module.exports = new RequisitionItemService();
