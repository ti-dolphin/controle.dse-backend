const KanbanStatusRequisitionRepository = require("../repositories/KanbanStatusRequisitionRepository");
const RequisitionRepository = require("../repositories/RequisitionRepository");
const {prisma } = require('../database');
const { getNowISODate } = require("../utils");
class RequisitionService {
  async getMany(user, params) {
    const { id_kanban_requisicao, searchTerm, filters } = params;
    
    // Se não for o kanban "5", aplica regras de acesso e status
    if (Number(id_kanban_requisicao) !== 5) {
      // Busca os status do kanban selecionado
      const kanbanStatusList = await KanbanStatusRequisitionRepository.getMany({id_kanban_requisicao: Number(id_kanban_requisicao)});
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
    const now = new Date();
    now.setHours(now.getHours() - 3);
    normalizedData.data_criacao = now.toISOString();
    normalizedData.data_alteracao = now.toISOString();
    normalizedData.criado_por = data.ID_RESPONSAVEL;
    normalizedData.alterado_por = data.ID_RESPONSAVEL;
    const newReq =  await RequisitionRepository.create(normalizedData);
    await this.processStatusChange(
      newReq.ID_REQUISICAO,
      newReq.criado_por.CODPESSOA,
      1,
      newReq.id_status_requisicao
    );
    return newReq;
  }

  async update(id_requisicao, data) {
    const req = await this.getById(id_requisicao);
    const statusChange = req.id_status_requisicao !== data.id_status_requisicao
    if (statusChange && data.id_status_requisicao) {
      await this.processStatusChange(
        id_requisicao,
        data.alterado_por,
        req.id_status_requisicao,
        data.id_status_requisicao
      );
    }
    data.data_alteracao = getNowISODate();
    return await RequisitionRepository.update(id_requisicao, data);
  }

  async cancel(id_requisicao) {
    return await RequisitionRepository.cancel(id_requisicao);
  }

  async activate(id_requisicao) {
    return await RequisitionRepository.activate(id_requisicao);
  }
  async processStatusChange(id_requisicao, alterado_por, oldStatusId, newStatusId) {
    const newStatusChange = await prisma.web_alteracao_req_status.create({
      data: {
        id_status_anterior: Number(oldStatusId),
        id_status_requisicao: Number(newStatusId),
        id_requisicao: Number(id_requisicao),
        alterado_por: Number(alterado_por),
        data_alteracao: getNowISODate(),
      },
    });
    return;
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
        profileId: 1
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
        profileId: 6
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
        profileId: 5
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
          profileId: 4
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
          profileId: 3
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
          profileId: 2
      },
    ];
  }

   normalizeFilters(filtersArray) {
    if(filtersArray){ 
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
