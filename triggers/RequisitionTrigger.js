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
    console.log("entrando no beforeUpdateStatus");
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
      const newStatus = await tx.web_status_requisicao.findFirst({
        where: {
          id_status_requisicao: newStatusId,
        },
      });
      const requisitionStatusisAdvancing = newStatus.etapa && req.status?.etapa
      const items = await tx.wEB_REQUISICAO_ITEMS.findMany({
        where: { id_requisicao: req.ID_REQUISICAO },
      });
      const productIdToITem = new Map();
      items.forEach((item) => {
        productIdToITem.set(item.id_produto, item);
      });
      // Filtra apenas os itens que possuem id_produto
      const itemsWithProductId = items.filter(item => !!item.id_produto);
      const products = await tx.produtos.findMany({
        where: { ID: { in: itemsWithProductId.map((item) => item.id_produto) } },
      });
      console.log("updatingToRequisitado", updatingToRequisitado);
      console.log("requisitionStatusisAdvancing", requisitionStatusisAdvancing);
    
      //mandando requisição para requisitado, vem a etapa de verificação do estoque s ehouver pelo menos um item no estoque
      if (updatingToRequisitado && requisitionStatusisAdvancing) {
        // Se tipo_faturamento for 2, pula toda a lógica de estoque e vai direto para compras
        if (req.tipo_faturamento === 2) {
          console.log("tipo_faturamento === 2: enviando requisição direto para compras, ignorando estoque");
          return; // Não faz nenhuma alteração, deixa seguir o fluxo normal de compras
        }

        const atLeastOneItemAvailable = products.some(
          (product) => (
            product.quantidade_estoque && product.quantidade_estoque > 0 && product.quantidade_disponivel > 0
          )
        );
        console.log("products", products);
        console.log("atLeastOneItemAvailable", atLeastOneItemAvailable);
        if (atLeastOneItemAvailable) {
            for (const product of products) { 
        const item = productIdToITem.get(product.ID);
        if (product.quantidade_disponivel < item.quantidade) {
          //se a quantidade disponível for menor que a quantidade solicitada, a quantidade reservada é igual a quantidade disponível
          console.log(`a quantidade disponível para o produto ${product.nome_fantasia} é menor que a quantidade solicitada, a quantidade reservada é igual a quantidade disponível`);
          await tx.wEB_REQUISICAO_ITEMS.update({
            where: { id_item_requisicao: item.id_item_requisicao },
            data: {
              quantidade_disponivel: product.quantidade_disponivel,
            },
          });
          await tx.produtos.update({
            where: { ID: product.ID },
            data: {
              quantidade_reservada: product.quantidade_disponivel,
            },
          });
          continue;
        }
        if (product.quantidade_disponivel >= item.quantidade) {
          console.log(`a quantidade disponível para o produto ${product.nome_fantasia} é maior ou igual à quantidade solicitada, a quantidade reservada é igual à quantidade solicitada`);
          await tx.wEB_REQUISICAO_ITEMS.update({
            where: { id_item_requisicao: item.id_item_requisicao },
            data: {
              quantidade_disponivel: item.quantidade,
            },
          });
          await tx.produtos.update({
            where: { ID: product.ID },
            data: {
              quantidade_reservada: item.quantidade,
            },
          });
        }
      }
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
      
      const currentStatus = await tx.web_status_requisicao.findFirst({
        where: { id_status_requisicao: req.id_status_requisicao }
      });
      
      const newStatusData = await tx.web_status_requisicao.findFirst({
        where: { id_status_requisicao: newStatusId }
      });
      
      const approvalStatusByScope = {
        2: 7,
        3: 110,
        5: 118
      };
      
      const approvalStatusId = approvalStatusByScope[req.id_escopo_requisicao];
      
      if (currentStatus && newStatusData && 
          Number(currentStatus.id_status_requisicao) === approvalStatusId &&
          newStatusData.etapa > currentStatus.etapa) {
        
        console.log(`[Trigger] Saindo de Aprovação Diretoria (status ${approvalStatusId}). Armazenando valor aprovado: R$ ${req.custo_total}`);
        
        await tx.wEB_REQUISICAO.update({
          where: { ID_REQUISICAO: req.ID_REQUISICAO },
          data: {
            valor_aprovado_diretoria: req.custo_total
          }
        });
      }

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

  static async checkValueChangeAfterApproval(reqBefore, reqAfter, tx) {
    // Mapeia escopo → status de aprovação, monitoramento e limite superior
    const scopeStatusMap = {
      2: { approval: 7, monitor: 8, maxStatus: 9 },      // Compras: até antes de "Comprar" (id 10)
      3: { approval: 110, monitor: 111, maxStatus: 112 }, // Faturamento: até antes de fase operacional
      5: { approval: 118, monitor: 119, maxStatus: 120 }  // Contratos: até antes de fase operacional
    };
    
    const scopeConfig = scopeStatusMap[reqBefore.id_escopo_requisicao];
    
    if (!scopeConfig) {
      console.log(`[RequisitionTrigger] Escopo ${reqBefore.id_escopo_requisicao} não possui configuração de aprovação`);
      return false;
    }

    // Se está atualmente no status de aprovação, não verifica (aprovador pode estar aprovando valor maior)
    if (Number(reqAfter.id_status_requisicao) === scopeConfig.approval) {
      console.log(`[RequisitionTrigger] Requisição ${reqBefore.ID_REQUISICAO} está em aprovação. Não verifica excesso de valor.`);
      return false;
    }

    // Se já passou da fase de cotação/monitoramento, não volta mais (já está em comprar, receber, etc)
    if (Number(reqAfter.id_status_requisicao) > scopeConfig.maxStatus) {
      console.log(`[RequisitionTrigger] Requisição ${reqBefore.ID_REQUISICAO} já está em fase operacional (status ${reqAfter.id_status_requisicao}). Não retorna para aprovação.`);
      return false;
    }

    // Verifica se já passou por aprovação da diretoria
    const statusHistory = await tx.web_alteracao_req_status.findMany({
      where: {
        id_requisicao: reqBefore.ID_REQUISICAO,
        id_status_requisicao: scopeConfig.approval
      }
    });

    console.log(statusHistory, 'statusHistory');

    const jaPassouPorAprovacaoDiretoria = statusHistory.length > 0;
    const estaAposMonitoramento = Number(reqAfter.id_status_requisicao) >= scopeConfig.monitor;

    // Verifica apenas se está entre Monitoramento e o limite superior (antes de Comprar)
    if (jaPassouPorAprovacaoDiretoria && estaAposMonitoramento) {
      const valorAprovado = Number(reqBefore.valor_aprovado_diretoria) || 0;
      const valorAtual = Number(reqAfter.custo_total) || 0;
      console.log(`[RequisitionTrigger] Requisição ${reqBefore.ID_REQUISICAO}: Valor aprovado R$ ${valorAprovado.toFixed(2)}, valor atual R$ ${valorAtual.toFixed(2)}`);
      const diferencaValor = valorAtual - valorAprovado;

      if (diferencaValor > 10) {
        console.log(`[RequisitionTrigger] Requisição ${reqBefore.ID_REQUISICAO}: Valor aumentou R$ ${diferencaValor.toFixed(2)}. Deve retornar para Aprovação Diretoria (status ${scopeConfig.approval}).`);
        return { shouldRevert: true, approvalStatusId: scopeConfig.approval, difference: diferencaValor };
      }
    }

    return false;
  }
}

module.exports = RequisitionTrigger;
