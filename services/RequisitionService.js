const KanbanStatusRequisitionRepository = require("../repositories/KanbanStatusRequisitionRepository");
const RequisitionRepository = require("../repositories/RequisitionRepository");
const {prisma } = require('../database');
const { getNowISODate } = require("../utils");
const QuoteService = require("./QuoteService");
const RequisitionItemService = require("./RequisitionItemService");
const RequisitionCommentService = require("./RequisitionCommentService");
const RequisitionStatusService = require("./RequisitionStatusService");
const RequisitionAttachmentService = require("./RequisitionAttachmentService");
const QuoteItemService = require("./QuoteItemService");
const RequisitionTrigger = require("../triggers/RequisitionTrigger");
class RequisitionService {
  async getMany(user, params) {
    const { id_kanban_requisicao, searchTerm, filters } = params;

    // Se não for o kanban "5", aplica regras de acesso e status
    if (Number(id_kanban_requisicao) !== 5) {
      // Busca os status do kanban selecionado
      const kanbanStatusList = await KanbanStatusRequisitionRepository.getMany({
        id_kanban_requisicao: Number(id_kanban_requisicao),
      });
      // Filtra as requisições permitidas para o usuário
      const filteredReqsByKanban = await this.getReqsBykanban(
        user,
        kanbanStatusList
      );
      // Busca as requisições filtradas por ID, termo de busca geral e filtros adicionais
      return await RequisitionRepository.findMany(
        { ID_REQUISICAO: { in: filteredReqsByKanban } },
        searchTerm,
        filters
      );
    }
    // Se for o kanban "5", retorna todas as requisições com filtros aplicados
    return await RequisitionRepository.findMany({}, searchTerm, filters);
  }

  async getReqsBykanban(user, kanbanStatusList) {
    const allStatusIds = kanbanStatusList.map(
      (item) => item.id_status_requisicao
    );
    const requisitions = await RequisitionRepository.findMany({
      id_status_requisicao: { in: allStatusIds },
    });

    const accessRules = await this.getAccessRulesByKanban(
      user,
      kanbanStatusList
    );

    const filteredReqIds = requisitions
      .filter((req) =>
        accessRules.some(
          (rule) => rule.check() && rule.match(req, user, rule.statusList())
        )
      )
      .map((req) => req.ID_REQUISICAO);
    return filteredReqIds;
  }

  getStatusListByProfile(kanban_status_list) {
    return kanban_status_list.reduce((acc, item) => {
      if (!acc[item.perfil]) {
        acc[item.perfil] = [];
      }
      acc[item.perfil].push(item.id_status_requisicao);
      return acc;
    }, {});
  }

  async getById(id_requisicao) {
    return await RequisitionRepository.findById(id_requisicao);
  }

  async create(data) {
    let normalizedData = { ...data };

    normalizedData.data_criacao = getNowISODate();
    normalizedData.data_alteracao = getNowISODate();
    normalizedData.criado_por = data.ID_RESPONSAVEL;
    normalizedData.alterado_por = data.ID_RESPONSAVEL;
    normalizedData.id_escopo_requisicao = 2;
    const newReq = await RequisitionRepository.create(normalizedData);
    await prisma.web_alteracao_req_status.create({
      data: {
        id_requisicao: newReq.ID_REQUISICAO,
        id_status_requisicao: newReq.id_status_requisicao,
        id_status_anterior: newReq.id_status_requisicao,
        data_alteracao: getNowISODate(),
        alterado_por: newReq.ID_RESPONSAVEL,
      },
    });
    return newReq;
  }

  async validateCreateCopy(id_requisicao, items, tx, originalItems) {
    const req = await this.getById(id_requisicao);
    if (!req) {
      throw new Error(`Requisição original não encontrada: ${id_requisicao}`);
    }
    const itemMap = new Map(
      originalItems.map((item) => [item.id_item_requisicao, item])
    );

    for (const childItem of items) {
      const origItem = itemMap.get(childItem.id_item_requisicao);
      if (!origItem) {
        throw new Error(
          `Item não encontrado na original: ${childItem.id_item_requisicao}`
        );
      }
      const newQty = Number(origItem.quantidade) - Number(childItem.quantidade);
      if (newQty < 0) {
        throw new Error(
          `Quantidade excede a original para item ${childItem.id_item_requisicao}: ${childItem.quantidade} > ${origItem.quantidade}`
        );
      }
    }
  }

  async createCopy(req, tx) {
    return await tx.web_requisicao.create({
      data: {
        ID_RESPONSAVEL: req.ID_RESPONSAVEL,
        id_status_requisicao: req.id_status_requisicao,
        DESCRIPTION: `${req.DESCRIPTION} - parcial`,
        TIPO: req.TIPO,
        ID_PROJETO: req.ID_PROJETO,
        id_escopo_requisicao: 2,
        data_criacao: getNowISODate(),
        data_alteracao: getNowISODate(),
      },
    });
  }

  async createFromOther(id_requisicao, items) {
    return prisma.$transaction(async (tx) => {
      // Validação de quantidades
      const originalItems = await tx.web_requisicao_items.findMany({
        where: { id_requisicao: Number(id_requisicao) },
      });
      await this.validateCreateCopy(id_requisicao, items, tx, originalItems);
      // Pegando requisição original
      const req = await this.getById(id_requisicao);
      // Criando nova requisição
      const newReq = await this.createCopy(req, tx);
      // Clonando cotações
      const { newQuoteByOldQuoteId, quoteItems } =
        await QuoteService.cloneQuotes(
          req.ID_REQUISICAO,
          newReq.ID_REQUISICAO,
          tx
        );

      // Atualizando ou excluindo itens da requisição original
      const updatedOriginalItems =
        await RequisitionItemService.distributeQuantities(
          originalItems,
          items,
          tx
        );
      // 4. Criando novos itens na requisição filha e mapeando IDs
      const { oldReqItemToNewId, newReqItems } = await RequisitionItemService.createChildItems(
          items,
          newReq.ID_REQUISICAO,
          tx
        );
      // 5. Comentários
      await RequisitionCommentService.cloneComments(
        req,
        newReq.ID_REQUISICAO,
        tx
      );
      // 6. Alterações de status
      await RequisitionStatusService.cloneStatusChanges(
        req.ID_REQUISICAO,
        newReq.ID_REQUISICAO,
        tx
      );
      // 7. Anexos
      await RequisitionAttachmentService.cloneAttachments(
        req.ID_REQUISICAO,
        newReq.ID_REQUISICAO,
        tx
      );
      // 8. Clonear itens de cotação
      const { oldQuoteItemToNewId } = await QuoteItemService.cloneQuoteItems(
        quoteItems,
        newQuoteByOldQuoteId,
        oldReqItemToNewId,
        tx
      );
      // 9. Atualizar id_item_cotacao nos novos itens de requisição
      const newItemsUpdated = await RequisitionItemService.updateQuoteItemIds(
        newReqItems,
        oldQuoteItemToNewId,
        tx
      );
      // Step 10: atualiza novas cotações e nova requisição com novos totais
      console.log("atualizando total novo");
      await RequisitionItemService.updateRequisitionWithNewTotals(
        newReq.ID_REQUISICAO,
        newItemsUpdated,
        tx
      );
      // Step 11: atualiza cotação e requisição original com novos totais
      console.log("atualizando total original");
      await RequisitionItemService.updateRequisitionWithNewTotals(
        req.ID_REQUISICAO,
        updatedOriginalItems,
        tx
      );
      //atualizar nova requisição com id da requisição original
      await tx.web_requisicao.update({
        where: { ID_REQUISICAO: newReq.ID_REQUISICAO },
        data: { id_req_original: req.ID_REQUISICAO },
      });
      return newReq;
    }, { 
      timeout: 120000
    });
  }

  async update(id_requisicao, data) {
    return await RequisitionRepository.update(id_requisicao, data);
  }

  async cancel(id_requisicao) {
    return await RequisitionRepository.cancel(id_requisicao);
  }

  async activate(id_requisicao) {
    return await RequisitionRepository.activate(id_requisicao);
  }

  oneAttendedItem(items) {
    return items.some((item) => item.quantidade_atendida > 0);
  }

  allItemsAttended(items) {
    console.log(
      "allItemsAttended",
      items.every((item) => {
        return (
          item.quantidade_atendida > 0 &&
          item.quantidade_atendida === item.quantidade
        );
      })
    );
    return items.every(
      (item) =>
        item.quantidade_atendida > 0 &&
        item.quantidade_atendida === item.quantidade
    );
  }

  // async attend(id, items) {

  //    //os items irão chegar com o campo quantidade_atendida preenchido
  //   return await prisma.$transaction(async (tx) => {
  //        const req = await tx.web_requisicao.findFirst({
  //          where: { ID_REQUISICAO: Number(id) },
  //        });
  //        //pega status 'requisitado'
  //           const requisitadoStatus = await tx.web_status_requisicao.findFirst(
  //          {
  //            where: {
  //              nome: "Requisitado",
  //            },
  //          }
  //        );
  //        const comprasItems = [];
  //        const stockItems = [];
  //        if (await this.oneAttendedItem(items)) {
  //          if (this.allItemsAttended(items)) {
  //           //se todos items atendidos
  //            const separacaoStatus =
  //              await tx.web_status_requisicao.findFirst({
  //                where: {
  //                  nome: "Em Separação",
  //                },
  //              });
  //            const updatedReq = await tx.web_requisicao
  //              .update({
  //                where: { ID_REQUISICAO: id },
  //                data: {
  //                  id_status_requisicao: separacaoStatus.id_status_requisicao,
  //                },
  //                include: RequisitionRepository.buildInclude(),
  //              }).then((result) => RequisitionRepository.formatRequisition(result));
  //              //caso todos os items tenha sido atendidos, a requisição original é atualizada para estoque e não criamos uma de compras pois não será preciso comprar
  //              throw new Error('todos itens atendidos')
  //            return {
  //             estoque: updatedReq,
  //             compras: null
  //            };
  //          }
  //          //se alguns items atendidos e alguns não atendidos
  //          //separar não atendidos em nova requisição do escopo compras e atendidos mantém na original
  //          const {
  //            ID_REQUISICAO,
  //            id_escopo_requisicao,
  //            id_status_requisicao,
  //            custo_total,
  //            ...rest
  //          } = req;
  //          //criando nova requsiição de comprar e clonando registros filhos
  //          const newComprasReq = await tx.web_requisicao.create({
  //            data: {
  //              ...rest,
  //              id_escopo_requisicao: 2,
  //              id_status_requisicao: requisitadoStatus.id_status_requisicao
  //            },
  //          });
  //          await RequisitionCommentService.cloneComments(req, newComprasReq.ID_REQUISICAO, tx);
  //          await RequisitionAttachmentService.cloneAttachments(req.ID_REQUISICAO, newComprasReq.ID_REQUISICAO, tx);
  //          await RequisitionStatusService.cloneStatusChanges(req.ID_REQUISICAO, newComprasReq.ID_REQUISICAO, tx);
  //          //separando os items para cada requisição (compras ou estoque)
  //          for (let item of items) {
  //           //item totalmente atendido
  //            if (item.quantidade_atendida === item.quantidade) {
  //              stockItems.push(item);
  //              continue;
  //            }
  //            //item não atendido
  //            if (!item.quantidade_atendida) {
  //              const newComprasReqItem = await this.cloneSingleItem(
  //                newComprasReq.ID_REQUISICAO,
  //                item,
  //                tx
  //              );
  //              await tx.web_requisicao_items.delete({  where: { id_item_requisicao: item.id_item_requisicao }});
  //              comprasItems.push(newComprasReqItem);
  //              continue;
  //            }
  //            //atendido parcialmente
  //            item.quantidade = item.quantidade - item.quantidade_atendida;
  //            const newComprasReqItem = await this.cloneSingleItem(
  //              newComprasReq.ID_REQUISICAO,
  //              item,
  //              tx
  //            );
  //            comprasItems.push(newComprasReqItem);
  //            const updatedStockItem = await tx.web_requisicao_items.update({
  //              where: { id_item_requisicao: item.id_item_requisicao },
  //              data: { quantidade: item.quantidade_atendida },
  //            });
  //            stockItems.push(updatedStockItem);
  //          }
  //          const separacaoStatus = await tx.web_status_requisicao.findFirst(
  //            {
  //              where: {
  //                nome: "Em Separação",
  //              },
  //            }
  //          );
  //          const updatedReq = await tx.web_requisicao
  //            .update({
  //              where: { ID_REQUISICAO: id },
  //              data: {
  //                id_status_requisicao: separacaoStatus.id_status_requisicao,
  //              },
  //              include: RequisitionRepository.buildInclude(),
  //            })
  //            .then((result) => RequisitionRepository.formatRequisition(result));
  //            //retornar as duas requisições, a original em estoque e a nova requisição de compras

  //          throw new Error("retornar as duas requisições, a original em estoque e a nova requisição de compras");
  //          return {
  //            estoque: updatedReq,
  //            compras: newComprasReq
  //           };
  //        }
  //        //nenhum item atendido --> retornar requisição original com escopo de compras
  //        const updatedReq = await tx.web_requisicao
  //          .update({
  //            where: { ID_REQUISICAO: id },
  //            data: {
  //              id_status_requisicao: requisitadoStatus.id_status_requisicao,
  //              id_escopo_requisicao: 2
  //            },
  //            include: RequisitionRepository.buildInclude(),
  //          })
  //          .then((result) => RequisitionRepository.formatRequisition(result));

  //       throw new Error("retornar a requisição original com escopo de compras");
  //        return {
  //          compras: updatedReq,
  //          estoque: null
  //        };
  //   })
  // }

  async attend(id, items) {
    console.log(
      `Starting attend process for requisition ID: ${id}, with ${items.length} items`
    );

    return await prisma.$transaction(async (tx) => {
      console.log("Transaction started");

      const req = await tx.web_requisicao.findFirst({
        where: { ID_REQUISICAO: Number(id) },
      });
      console.log(
        `Fetched requisition: ${req ? `ID ${req.ID_REQUISICAO}` : "Not found"}`
      );
      if (!req) {
        console.error("Requisition not found");
        throw new Error("Requisition not found");
      }

      const requisitadoStatus = await tx.web_status_requisicao.findFirst({
        where: { nome: "Requisitado" },
      });
      console.log(
        `Fetched 'Requisitado' status: ${
          requisitadoStatus
            ? `ID ${requisitadoStatus.id_status_requisicao}`
            : "Not found"
        }`
      );
      if (!requisitadoStatus) {
        console.error("Requisitado status not found");
        throw new Error("Requisitado status not found");
      }

      const comprasItems = [];
      const stockItems = [];
      console.log("Checking if at least one item is attended");
      if (await this.oneAttendedItem(items)) {
        console.log("At least one item is attended");
        if (this.allItemsAttended(items)) {
          console.log("All items are fully attended");
          const separacaoStatus = await tx.web_status_requisicao.findFirst({
            where: { nome: "Em Separação" },
          });
          console.log(
            `Fetched 'Em Separação' status: ${
              separacaoStatus
                ? `ID ${separacaoStatus.id_status_requisicao}`
                : "Not found"
            }`
          );
          if (!separacaoStatus) {
            console.error("Em Separação status not found");
            throw new Error("Em Separação status not found");
          }

          const updatedReq = await tx.web_requisicao
            .update({
              where: { ID_REQUISICAO: id },
              data: {
                id_status_requisicao: separacaoStatus.id_status_requisicao,
              },
              include: RequisitionRepository.buildInclude(),
            })
            .then((result) => {
              console.log(`Updated requisition ${id} to 'Em Separação' status`);
              return RequisitionRepository.formatRequisition(result);
            });

            for(let item of items) {
              const updatedProduct = await tx.produtos.update({
                where: { ID: item.id_produto },
                data: {
                  quantidade_reservada: item.quantidade_atendida,
                },
              });
              console.log(
                `Updated product ${updatedProduct.ID} to quantity ${updatedProduct.quantidade_reservada}`
              );
            }

          console.log("Throwing error: All items attended");
          // throw new Error("todos itens atendidos");
          return {
            estoque: updatedReq,
            compras: null,
          };
        }

        console.log("Some items are attended, splitting requisitions");
        const {
          ID_REQUISICAO,
          id_escopo_requisicao,
          id_status_requisicao,
          custo_total,
          ...rest
        } = req;
        const newComprasReq = await tx.web_requisicao.create({
          data: {
            ...rest,
            id_escopo_requisicao: 2,
            id_status_requisicao: requisitadoStatus.id_status_requisicao,
          },
        });
        console.log(
          `Created new compras requisition: ID ${newComprasReq.ID_REQUISICAO}`
        );

        console.log("Cloning comments, attachments, and status changes");
        await RequisitionCommentService.cloneComments(
          req,
          newComprasReq.ID_REQUISICAO,
          tx
        );
        console.log("Comments cloned successfully");
        await RequisitionAttachmentService.cloneAttachments(
          req.ID_REQUISICAO,
          newComprasReq.ID_REQUISICAO,
          tx
        );
        console.log("Attachments cloned successfully");
        await RequisitionStatusService.cloneStatusChanges(
          req.ID_REQUISICAO,
          newComprasReq.ID_REQUISICAO,
          tx
        );
        console.log("Status changes cloned successfully");

        console.log("Processing items for stock and compras requisitions");
        for (let item of items) {
          if (item.quantidade_atendida === item.quantidade) {
            console.log(
              `Item ${item.id_item_requisicao} fully attended, adding to stock`
            );
            stockItems.push(item);
            continue;
          }
          if (!item.quantidade_atendida) {
            console.log(
              `Item ${item.id_item_requisicao} not attended, moving to compras`
            );
            const newComprasReqItem = await this.cloneSingleItem(
              newComprasReq.ID_REQUISICAO,
              item,
              tx
            );
            await tx.web_requisicao_items.delete({
              where: { id_item_requisicao: item.id_item_requisicao },
            });
            comprasItems.push(newComprasReqItem);
            console.log(
              `Item ${item.id_item_requisicao} moved to compras requisition`
            );
            continue;
          }
          console.log(`Item ${item.id_item_requisicao} partially attended`);
          item.quantidade = item.quantidade - item.quantidade_atendida;
          const newComprasReqItem = await this.cloneSingleItem(
            newComprasReq.ID_REQUISICAO,
            item,
            tx
          );
          comprasItems.push(newComprasReqItem);
          console.log(
            `Cloned item ${item.id_item_requisicao} to compras requisition`
          );
          const updatedStockItem = await tx.web_requisicao_items.update({
            where: { id_item_requisicao: item.id_item_requisicao },
            data: { quantidade: item.quantidade_atendida },
          });
          //atualizar produto com quantidade reservada
          const updatedProduct = await tx.produtos.update({
            where: { 
              ID: item.id_produto,

            },
            data: { 
              quantidade_reservada: {
                decrement: item.quantidade_atendida,
              },
            }
          });

          stockItems.push(updatedStockItem);
          console.log(
            `Updated item ${item.id_item_requisicao} in stock requisition`
          );
          console.log(`Product ${updatedProduct.ID} updated with new quantity ${updatedProduct.quantidade_reservada}`);
        }

        const separacaoStatus = await tx.web_status_requisicao.findFirst({
          where: { nome: "Em Separação" },
        });
        console.log(
          `Fetched 'Em Separação' status: ${
            separacaoStatus
              ? `ID ${separacaoStatus.id_status_requisicao}`
              : "Not found"
          }`
        );
        if (!separacaoStatus) {
          console.error("Em Separação status not found");
          throw new Error("Em Separação status not found");
        }

        const updatedReq = await tx.web_requisicao
          .update({
            where: { ID_REQUISICAO: id },
            data: {
              id_status_requisicao: separacaoStatus.id_status_requisicao,
            },
            include: RequisitionRepository.buildInclude(),
          })
          .then((result) => {
            console.log(
              `Updated original requisition ${id} to 'Em Separação' status`
            );
            return RequisitionRepository.formatRequisition(result);
          });

        console.log(
          "Throwing error: Returning both stock and compras requisitions"
        );
        // throw new Error(
        //   "retornar as duas requisições, a original em estoque e a nova requisição de compras"
        // );
        return {
          estoque: updatedReq,
          compras: newComprasReq,
        };
      }

      console.log("No items attended, updating requisition to compras scope");
      const updatedReq = await tx.web_requisicao
        .update({
          where: { ID_REQUISICAO: id },
          data: {
            id_status_requisicao: requisitadoStatus.id_status_requisicao,
            id_escopo_requisicao: 2,
          },
          include: RequisitionRepository.buildInclude(),
        })
        .then((result) => {
          console.log(`Updated requisition ${id} to compras scope`);
          return RequisitionRepository.formatRequisition(result);
        });

      console.log("Throwing error: Returning original requisition as compras");
      // throw new Error("retornar a requisição original com escopo de compras");
      return {
        compras: updatedReq,
        estoque: null,
      };
    });
  }

  async cloneSingleItem(newReqId, item, tx) {
    //primeiro remove campos não utilizados
    const {
      id_item_requisicao,
      id_requisicao,
      anexos,
      produto,
      produto_descricao,
      produto_codigo,
      produto_unidade,
      produto_quantidade_estoque,
      produto_quantidade_disponivel,
      items_cotacao,
      quantidade_atendida,
      ...rest
    } = item;
    const newItem = await tx.web_requisicao_items.create({
      data: {
        id_requisicao: newReqId,
        ...rest,
      },
    });
    const attachments = await tx.web_anexos_item_requisicao.findMany({
      where: { id_item_requisicao: item.id_item_requisicao },
    });
    const clonedAttachments = [];

    for (const attachment of attachments) {
      const { id_anexo_item_requisicao, id_item_requisicao, ...rest } =
        attachment;
      const clonedAttachment = await tx.web_anexos_item_requisicao.create({
        data: { id_item_requisicao: newItem.id_item_requisicao, ...rest },
      });
      clonedAttachments.push(clonedAttachment);
    }
    return newItem;
  }

  async changeStatus(id_requisicao, newStatusId, alterado_por) {
    return await prisma.$transaction(async (tx) => {
      const req = await tx.web_requisicao.findFirst({
        where: { ID_REQUISICAO: id_requisicao },
      });
      let updatedReq = await RequisitionTrigger.beforeUpdateStatus(
        req,
        newStatusId,
        alterado_por,
        tx
      );
      if (updatedReq) {
        console.log(`não é status de verificação de estoque`);
         await tx.web_alteracao_req_status.create({
           data: {
             id_status_anterior: req.id_status_requisicao,
             id_status_requisicao: updatedReq.id_status_requisicao,
             id_requisicao: updatedReq.ID_REQUISICAO,
             alterado_por: alterado_por,
             data_alteracao: getNowISODate(),
           },
         });
        
        return updatedReq;
      }
      //não é status de verificação de estoque
      updatedReq = await tx.web_requisicao
        .update({
          where: { ID_REQUISICAO: id_requisicao },
          data: {
            id_status_requisicao: newStatusId,
            alterado_por: alterado_por,
          },
          include: RequisitionRepository.buildInclude(),
        })
        .then((result) => RequisitionRepository.formatRequisition(result));
      await tx.web_alteracao_req_status.create({
        data: {
          id_status_anterior: req.id_status_requisicao,
          id_status_requisicao: newStatusId,
          id_requisicao: id_requisicao,
          alterado_por: alterado_por,
          data_alteracao: getNowISODate(),
        },
      });
      // cria histórico
      // throw new Error("not implemented");
      return updatedReq;
    });
  }

  async delete(id_requisicao) {
    await RequisitionTrigger.beforeDelete(id_requisicao);
    return await RequisitionRepository.delete(id_requisicao);
  }
  async getAccessRulesByKanban(user, kanbanStatusList) {
    const profiles = await prisma.web_perfil_usuario.findMany();
    const statusByProfile = this.getStatusListByProfile(kanbanStatusList);
    console.log("Estados disponíveis para este kanban", statusByProfile);
   
    return [
      {
        // Administrador: acesso total
        check: () => Number(user.PERM_ADMINISTRADOR) === 1,
        statusList: () => null, // ignora status
        match: () => true,
        profileId: 1,
      },
      {
        // Comprador
        check: () => Number(user.PERM_COMPRADOR) === 1,
        statusList: () => {
          const profileId = profiles.find(
            (p) => p.nome === "Comprador"
          ).id_perfil_usuario;
          return statusByProfile[profileId];
        },
        match: (req, user, statusList) =>
          statusList && statusList.includes(Number(req.id_status_requisicao)),
        profileId: 6,
      },
      {
        // Diretor
        check: () => Number(user.PERM_DIRETOR) === 1,
        statusList: () => {
          const profileId = profiles.find(
            (p) => p.nome === "Diretor"
          ).id_perfil_usuario;
          return statusByProfile[profileId];
        },
        match: (req, user, statusList) =>
          statusList && statusList.includes(Number(req.id_status_requisicao)),
        profileId: 5,
      },
      {
        // Gerente do projeto
        check: () => true,
        statusList: () => {
          const profileId = profiles.find(
            (p) => p.nome === "Gerente"
          ).id_perfil_usuario;
          return statusByProfile[profileId];
        },
        match: (req, user, statusList) =>
          req.gerente &&
          Number(req.gerente.CODPESSOA) === Number(user.CODPESSOA) &&
          statusList &&
          statusList.includes(Number(req.id_status_requisicao)),
        profileId: 4,
      },
      {
        // Coordenador do projeto
        check: () => true,
        statusList: () => {
          const profileId = profiles.find(
            (p) => p.nome === "Coordenador"
          ).id_perfil_usuario;
          return statusByProfile[profileId];
        },
        match: (req, user, statusList) =>
          req.projeto &&
          Number(req.projeto.ID_RESPONSAVEL) === Number(user.CODPESSOA) &&
          statusList &&
          statusList.includes(Number(req.id_status_requisicao)),
        profileId: 3,
      },
      {
        // Requisitante
        check: () => true,
        statusList: () => {
          const profileId = profiles.find(
            (p) => p.nome === "Requisitante"
          ).id_perfil_usuario;
          return statusByProfile[profileId];
        },
        match: (req, user, statusList) =>
          req.responsavel &&
          Number(req.responsavel.CODPESSOA) === Number(user.CODPESSOA) &&
          statusList &&
          statusList.includes(Number(req.id_status_requisicao)),
        profileId: 2,
      },
      {
        check: () => Number(user.PERM_ESTOQUE) === 1,
        statusList: () => { 
          const profileId = profiles.find(
            (p) => p.nome === "Estoquista"
          ).id_perfil_usuario;
          return statusByProfile[profileId];
        },
        match: (req, user, statusList) => statusList && statusList.includes(Number(req.id_status_requisicao)),
        profileId: 7,
      },

    ];
  }

  normalizeFilters(filtersArray) {
    if (filtersArray) {
      const intFields = ["ID_REQUISICAO"];
      return filtersArray.map((filter) => {
        // Só há uma chave por objeto
        const [field, value] = Object.entries(filter)[0];
        // Se for campo numérico, converte todos os valores possíveis para número
        if (intFields.includes(field)) {
          // Exemplo: { equals: "88" } => { equals: 88 }
          const newValue = {};
          for (const op in value) {
            if (typeof value[op] === "string" && !isNaN(value[op])) {
              newValue[op] = Number(value[op]);
            } else {
              newValue[op] = value[op];
            }
          }
          return { [field]: newValue };
        }

        // Para campos aninhados, verifica recursivamente
        function deepNormalize(obj) {
          if (typeof obj !== "object" || obj === null) return obj;
          const result = Array.isArray(obj) ? [] : {};
          for (const k in obj) {
            if (
              intFields.includes(k) &&
              typeof obj[k] === "string" &&
              !isNaN(obj[k])
            ) {
              result[k] = Number(obj[k]);
            } else if (typeof obj[k] === "object") {
              result[k] = deepNormalize(obj[k]);
            } else {
              result[k] = obj[k];
            }
          }
          return result;
        }

        return { [field]: deepNormalize(value) };
      });
    }
    return [];
  }
}

module.exports = new RequisitionService();

