const RequisitionRepository = require("../repositories/RequisitionRepository");
const { getNowISODate } = require("../utils");

class RequisitionTrigger {
  constructor() {
    // Initialize any required properties or dependencies here
  }

  static async beforeCreate(requisition) {
    try {
      // Logic to execute before creating a requisition
      console.log("Before create trigger executed", requisition);
    } catch (error) {
      console.error("Error in beforeCreate trigger", error);
      throw error;
    }
  }

  static async afterCreate(requisition) {
    try {
      // Logic to execute after creating a requisition
      console.log("After create trigger executed", requisition);
    } catch (error) {
      console.error("Error in afterCreate trigger", error);
      throw error;
    }
  }

  static async beforeUpdateStatus(req, newStatusId, alterado_por, tx) {
    try {
      //status da segunda etapa
      const secondPhaseStatuses = await tx.web_status_requisicao
        .findMany({
          where: {
            etapa: 2,
            NOT: {
              nome: "Separado",
            },
          },
        })
        .then((results) => results.map((r) => r.id_status_requisicao));
      //status final do escopo estoque
      const finalStockstatus = await tx.web_status_requisicao.findFirst({
        where: {
          nome: "Separado",
        },
      });
      //status atual
      const currentStatus = await tx.web_requisicao
        .findFirst({
          where: { ID_REQUISICAO: req.ID_REQUISICAO },
        })
        .then((result) => result.id_status_requisicao);
      //items da requisição
      const items = await tx.web_requisicao_items.findMany({
        where: { id_requisicao: req.ID_REQUISICAO },
      });
      //produtos da requisição
      const products = await tx.produtos.findMany({
        where: { ID: { in: items.map((item) => item.id_produto) } },
      });
      //se o novo status for da etapa 2, ou seja, validação (verifica estoque dos itens solicitados, se houver, gera uma outra requisição com aqueles itens e manda a original para a próxima etapa)
      if (secondPhaseStatuses.includes(newStatusId)) {
        
        const itemIdToItem = new Map();
        items.forEach((item) => {
          itemIdToItem.set(item.id_item_requisicao, item);
        });

        const atLeastOneInStock = products.some(
          (product) =>
            product.quantidade_estoque && product.quantidade_estoque > 0
        );

        if (atLeastOneInStock) {
          const firstStockStatus = await tx.web_status_requisicao.findFirst({
            where: {
              nome: "Separar Estoque",
            },
          });
          const newReq = await tx.web_requisicao.create({
            data: {
              ID_RESPONSAVEL: req.ID_RESPONSAVEL,
              id_status_requisicao: firstStockStatus.id_status_requisicao,
              id_escopo_requisicao: firstStockStatus.id_escopo_requisicao,
              DESCRIPTION: req.DESCRIPTION,
              TIPO: req.TIPO,
              ID_PROJETO: req.ID_PROJETO,
              data_criacao: getNowISODate(),
              data_alteracao: getNowISODate(),
            },
          });
          const comments = await tx.web_comentarios_requsicao.findMany({
            where: { id_requisicao: req.ID_REQUISICAO },
          });
          const newComments = await tx.web_comentarios_requsicao.createMany({
            data: comments.map(({ id_comentario_requisicao, ...rest }) => ({
              ...rest,
              id_requisicao: newReq.ID_REQUISICAO,
            })),
          });
          const attachments = await tx.web_anexos_requisicao.findMany({
            where: { id_requisicao: req.ID_REQUISICAO },
          });
          const newAttachments = await tx.web_anexos_requisicao.createMany({
            data: attachments.map(({ id_anexo_requisicao, ...rest }) => ({
              ...rest,
              id_requisicao: newReq.ID_REQUISICAO,
            })),
          });
          const statusChanges = await tx.web_alteracao_req_status.findMany({
            where: { id_requisicao: req.ID_REQUISICAO },
          });
          const newStatusChanges = await tx.web_alteracao_req_status.createMany(
            {
              data: statusChanges.map(({ id_alteracao, ...rest }) => ({
                ...rest,
                id_requisicao: newReq.ID_REQUISICAO,
              })),
            }
          );
          const productIdToItem = new Map();
          const productIdToProduct = new Map();
          items.forEach((item) => {
            productIdToItem.set(item.id_produto, item);
          });
          const itemIdInStockToQuantity = new Map();
          products.forEach((product) => {
            productIdToProduct.set(product.ID, product);
            const productHasStock =
              product.quantidade_estoque &&
              product.quantidade_estoque > 0 &&
              product.quantidade_reservada <= product.quantidade_estoque;
            if (productHasStock) {
              const availableQuantity = product.quantidade_estoque - product.quantidade_reservada;
              const item = productIdToItem.get(product.ID);
              const tottalyAvalable = availableQuantity >= item.quantidade;
              const parciallyAvalable = availableQuantity < item.quantidade;
              const difference = Math.abs(availableQuantity - item.quantidade);
              itemIdInStockToQuantity.set(item.id_item_requisicao, {
                availableQuantity: product.quantidade_estoque,
                demandedQuantity: item.quantidade_solicitada,
                belongsToNewRequisition: tottalyAvalable,
                quantityInOldRequisition: parciallyAvalable ? difference : 0,
                quantityInNewRequisition: parciallyAvalable
                  ? availableQuantity
                  : tottalyAvalable
                  ? item.quantidade
                  : 0,
              });
            }
          });
          const newReqItems = [];
          const originalReqItemsUpdated = [];
          const updatedProducts = [];
          for (const [
            itemId,
            {
              availableQuantity,
              demandedQuantity,
              belongsToNewRequisition,
              quantityInOldRequisition,
              quantityInNewRequisition,
            },
          ] of itemIdInStockToQuantity) {
            if (belongsToNewRequisition) {
              const newItem = await tx.web_requisicao_items.create({
                data: {
                  id_requisicao: newReq.ID_REQUISICAO,
                  id_produto: itemIdToItem.get(itemId).id_produto,
                  quantidade: quantityInNewRequisition,
                },
              });
              const updatedProduct = await tx.produtos.update({
                where: { ID: itemIdToItem.get(itemId).id_produto },
                data: {
                  quantidade_reservada:
                    productIdToProduct.get(newItem.id_produto)
                      .quantidade_reservada + quantityInNewRequisition,
                },
              });
              updatedProducts.push(updatedProduct);
              newReqItems.push(newItem);
              await tx.web_requisicao_items.delete({
                where: { id_item_requisicao: itemId },
              });
              continue;
            }

            const newItem = await tx.web_requisicao_items.create({
              data: {
                quantidade: quantityInNewRequisition,
                id_produto: itemIdToItem.get(itemId).id_produto,
                id_requisicao: newReq.ID_REQUISICAO,
              },
            });
            const updatedProduct = await tx.produtos.update({
              where: { ID: itemIdToItem.get(itemId).id_produto },
              data: {
                quantidade_reservada:
                  productIdToProduct.get(newItem.id_produto)
                    .quantidade_reservada + quantityInNewRequisition,
              },
            });
            updatedProducts.push(updatedProduct);
            newReqItems.push(newItem);
            const updatedItem = await tx.web_requisicao_items.update({
              where: { id_item_requisicao: itemId },
              data: {
                quantidade: quantityInOldRequisition,
              },
            });
            originalReqItemsUpdated.push(updatedItem);
          }
          //requisição velha sem itens pois todos tem em estoque --> cancelada
          if (!originalReqItemsUpdated.length) {
            const cancelledStatus = await tx.web_status_requisicao.findFirst({
              where: { nome: "Cancelado" },
            });
            const updetedReq = await tx.web_requisicao
              .update({
                where: { ID_REQUISICAO: req.ID_REQUISICAO },
                data: {
                  id_status_requisicao: cancelledStatus.id_status_requisicao,
                  alterado_por: alterado_por,
                },
                include: RequisitionRepository.buildInclude(),
              })
              .then((result) =>
                RequisitionRepository.formatRequisition(result)
              );
              
            return updetedReq;
          }
          //atualiza a req original para o novo status desejado havendo items
          const updetedReq = await tx.web_requisicao
            .update({
              where: { ID_REQUISICAO: req.ID_REQUISICAO },
              data: {
                id_status_requisicao: newStatusId,
                alterado_por: alterado_por,
              },
              include: RequisitionRepository.buildInclude(),
            })
            .then((result) => RequisitionRepository.formatRequisition(result));

            console.log("original", originalReqItemsUpdated);
            console.log("novos", newReqItems);
            
          return updetedReq;
        }
      }
      //se o novo status for o ultimo estados do escopo estoque, precisamos fazer a baixa no estoque
      if (newStatusId === finalStockstatus.id_status_requisicao) {
           const productIdToItem = new Map();
           const productIdToProduct = new Map();
           const itemIdToItem = new Map();
           items.forEach((item) => {productIdToItem.set(item.id_produto, item);});
           products.forEach((product) => { productIdToProduct.set(product.ID, product)});
           items.forEach((item) => {itemIdToItem.set(item.id_item_requisicao, item)});
            const updatedProducts = [];
            for(const product of products){ 
                 const newAvailableQuantity = product.quantidade_estoque - product.quantidade_reservada;
                 const newReservedQuantity = product.quantidade_reservada - product.quantidade_reservada;
                 product.quantidade_estoque = newAvailableQuantity;
                 product.quantidade_reservada = newReservedQuantity;
                 const updatedProd = await tx.produtos.update({
                   where: { ID: product.ID },
                   data: {
                     quantidade_estoque: newAvailableQuantity,
                     quantidade_reservada: newReservedQuantity,
                   },
                 });
                 updatedProducts.push(updatedProd);
            }

            const updetedReq = await tx.web_requisicao
            .update({
              where: { ID_REQUISICAO: req.ID_REQUISICAO },
              data: {
                id_status_requisicao: newStatusId,
                alterado_por: alterado_por,
              },
              include: RequisitionRepository.buildInclude(),
            })
            .then((result) => RequisitionRepository.formatRequisition(result));
            return updetedReq;
      }

      // Logic to execute before updating a requisition
    } catch (error) {
      console.error("Error in beforeUpdate trigger", error);
      throw error;
    }
  }

  static async handleFinalStockStatus() {}

  static async afterUpdate(requisition) {
    try {
      // Logic to execute after updating a requisition
      console.log("After update trigger executed", requisition);
    } catch (error) {
      console.error("Error in afterUpdate trigger", error);
      throw error;
    }
  }

  static async beforeDelete(requisition) {
    try {
      // Logic to execute before deleting a requisition
      console.log("Before delete trigger executed", requisition);
    } catch (error) {
      console.error("Error in beforeDelete trigger", error);
      throw error;
    }
  }

  static async afterDelete(requisition) {
    try {
      // Logic to execute after deleting a requisition
      console.log("After delete trigger executed", requisition);
    } catch (error) {
      console.error("Error in afterDelete trigger", error);
      throw error;
    }
  }
}

module.exports = RequisitionTrigger;
