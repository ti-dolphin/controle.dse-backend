const KanbanStatusRequisitionRepository = require("../repositories/KanbanStatusRequisitionRepository");
const RequisitionRepository = require("../repositories/RequisitionRepository");
const {prisma } = require('../database');
class RequisitionService {

  async getMany(user, params) {
    // Busca lista de status por perfil no kanban
    const { id_kanban_requisicao } = params;
    if (Number(id_kanban_requisicao) !== 5) {
      const kanbanStatusList = await KanbanStatusRequisitionRepository.getMany({
        id_kanban_requisicao,
      });
      const filteredReqsByKanban = await this.getReqsBykanban(
        user,
        kanbanStatusList
      );
      return await RequisitionRepository.findMany({
        ID_REQUISICAO: { in: filteredReqsByKanban },
      });
    };

    return await RequisitionRepository.findMany({});
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

  async getById(id) {
    return await RequisitionRepository.findById(id);
  }

  async create(data) {
    console.log("Creating requisition with data:", data);
    return await RequisitionRepository.create(data);
  }

  async update(id, data) {
    return await RequisitionRepository.update(id, data);
  }

  async delete(id) {
    return await RequisitionRepository.delete(id);
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
      },
    ];
  }
}

module.exports = new RequisitionService();
