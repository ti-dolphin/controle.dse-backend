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
      }
    })
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
        DESCRIPTION: req.DESCRIPTION,
        TIPO: req.TIPO,
        ID_PROJETO: req.ID_PROJETO,
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
      const { oldReqItemToNewId, newReqItems } =
        await RequisitionItemService.createChildItems(
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
      return newReq;
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
      if(updatedReq){
        return updatedReq;
      }
      //não é status de verificação de estoque

       updatedReq = await tx.web_requisicao.update({
        where: { ID_REQUISICAO: id_requisicao },
        data: {
          id_status_requisicao: newStatusId,
          alterado_por: alterado_por,
        },
        include: RequisitionRepository.buildInclude()
      }).then((result) => RequisitionRepository.formatRequisition(result));
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
      return updatedReq;
    
    });
  }

  async delete(id_requisicao) {
    return await RequisitionRepository.delete(id_requisicao);
  }
  async getAccessRulesByKanban(user, kanbanStatusList) {
    const profiles = await prisma.web_perfil_usuario.findMany();
    const statusByProfile = this.getStatusListByProfile(kanbanStatusList);

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
module.exports = new RequisitionService();
