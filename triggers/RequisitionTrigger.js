const { prisma } = require("../database");
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
      const { ID_REQUISICAO } = requisition;
      return prisma.$transaction(async (tx) => {
        const updatedReq = await tx.wEB_REQUISICAO.update({
          where: { ID_REQUISICAO },
          data: {
            id_req_original: ID_REQUISICAO,
          },
        });
        console.log("After create trigger executed", updatedReq);
        return updatedReq;
      });
    } catch (error) {
      console.error("Error in afterCreate trigger", error);
      throw error;
    }
  }

  static async updatingToRequisitado(newStatusId, tx) {
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
    return secondPhaseStatuses.includes(newStatusId);
  }

  static async beforeUpdateStatus(req, newStatusId, alterado_por, tx) {
    try {
      //status final do escopo estoque
      const finalStockstatus = await tx.web_status_requisicao.findFirst({
        where: {
          nome: "Separado",
        },
      });
      const updatingToRequisitado = await this.updatingToRequisitado(
        newStatusId,
        tx
      );
      const items = await tx.wEB_REQUISICAO_ITEMS.findMany({
        where: { id_requisicao: req.ID_REQUISICAO },
      });
       const itemIdToItem = new Map();
       items.forEach((item) => {
         itemIdToItem.set(item.id_item_requisicao, item);
       });
      const products = await tx.produtos.findMany({
        where: { ID: { in: items.map((item) => item.id_produto) } },
      });
      //mandando requisição para requisitado, vem a etapa de verificação do estoque s ehouver pelo menos um item no estoque
      if (updatingToRequisitado) {
        const atLeastOneInStock = products.some(
          (product) =>
            product.quantidade_estoque && product.quantidade_estoque > 0
        );
        if (atLeastOneInStock) {
          console.log(`há pelo menos um item em estoqe, a requisição é retornada com escopo do estoque`);
          const firstStockStatus = await tx.web_status_requisicao.findFirst({
            where: {
              nome: "Separar Estoque",
            },
          });
          
          const updatedReq = await tx.wEB_REQUISICAO.update({
            where: { ID_REQUISICAO: req.ID_REQUISICAO },
            data: {
              id_escopo_requisicao: 1,
              id_status_requisicao: firstStockStatus.id_status_requisicao,
            },
          });
          return updatedReq;
        }
      }
      console.log("finalStockstatus", finalStockstatus);
      
      //se o novo status for o ultimo estados do escopo estoque, precisamos fazer a baixa no estoque
      if (newStatusId === finalStockstatus.id_status_requisicao) {
        
        const productIdToItem = new Map();
        const productIdToProduct = new Map();
        const itemIdToItem = new Map();
        items.forEach((item) => {
          productIdToItem.set(item.id_produto, item);
        });
        products.forEach((product) => {
          productIdToProduct.set(product.ID, product);
        });
        items.forEach((item) => {
          itemIdToItem.set(item.id_item_requisicao, item);
        });
        const updatedProducts = [];
        for (const product of products) {
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

        const updetedReq = await tx.wEB_REQUISICAO
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

  static async createCopyOfRequisitionWithChilds(req, tx) {
    const newReq = await tx.wEB_REQUISICAO.create({
      data: {
        ID_RESPONSAVEL: req.ID_RESPONSAVEL,
        id_status_requisicao: req.id_status_requisicao,
        id_escopo_requisicao: req.id_escopo_requisicao,
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
    const newStatusChanges = await tx.web_alteracao_req_status.createMany({
      data: statusChanges.map(({ id_alteracao, ...rest }) => ({
        ...rest,
        id_requisicao: newReq.ID_REQUISICAO,
      })),
    });
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

  static async beforeDelete(id_requisicao) {
    try {
      await prisma.$transaction(async (tx) => {
        const reqBelongsToStock = await this.reqInStockScope(id_requisicao, tx);
        if (reqBelongsToStock) {
          await this.subtractDeletedReqItemsQuantityFromReserves(
            id_requisicao,
            tx
          );
        }
        return;
      });
      // Logic to execute before deleting a requisition
    } catch (error) {
      console.error("Error in beforeDelete trigger", error);
      throw error;
    }
  }

  static async reqInStockScope(id_requisicao, tx) {
    const reqsInStockScope = await tx.wEB_REQUISICAO
      .findMany({
        where: {
          id_escopo_requisicao: 1,
        },
      })
      .then((result) => result.map((req) => req.ID_REQUISICAO));
    return reqsInStockScope.includes(id_requisicao);
  }

  static async subtractDeletedReqItemsQuantityFromReserves(id_requisicao, tx) {
    const items = await tx.wEB_REQUISICAO_ITEMS
      .findMany({
        where: { id_requisicao: id_requisicao },
        include: {
          produtos: true,
        },
      })
      .then((result) =>
        result.map((item) => {
          return {
            ...item,
            produto: item.produtos,
          };
        })
      );
    const itemIdToProduct = new Map();
    items.forEach((item) => {
      itemIdToProduct.set(item.id_item_requisicao, item.produto);
    });
    const updatedProducts = [];
    for (const item of items) {
      const { quantidade_reservada } = itemIdToProduct.get(
        item.id_item_requisicao
      );
      const newReservedQuantity = quantidade_reservada - item.quantidade;
      const updatedProduct = await tx.produtos.update({
        where: { ID: item.id_produto },
        data: {
          quantidade_reservada: newReservedQuantity > 0 ? newReservedQuantity : 0,
        },
      });
      updatedProducts.push(updatedProduct);
    }
    return;
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
