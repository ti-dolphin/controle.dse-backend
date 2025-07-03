const {prisma} = require('../database');
const KanbanStatusRequisitionRepository = require('../repositories/KanbanStatusRequisitionRepository');
const RequisitionStatusRepository = require("../repositories/RequisitionStatusRepository");
const RequisitionService = require("./RequisitionService");

class RequisitionStatusService {
  async create(data) {
    return RequisitionStatusRepository.create(data);
  }

  async getMany(params) {
    return RequisitionStatusRepository.getMany(params);
  }

  async getById(id_status_requisicao) {
    return RequisitionStatusRepository.getById(id_status_requisicao);
  }

  /**
   * Verifica se o usuário tem permissão para alterar o status da requisição.
   *
   * @param {Object} user - Usuário autenticado.
   * @param {Object} requisition - Requisição a ser verificada.
   * @returns {Promise<Object>} Retorna um objeto com a permissão para alterar o status.
   */
  async getStatusPermission(user, requisition){
    let permissionToChangeStatus;
    
    if (Number(user.PERM_ADMINISTRADOR) === 1) {
      //Se o usuário for administrador, ele tem permissão
      permissionToChangeStatus = true;
      return { permissionToChangeStatus };
    }
    //pega  o quadro kanban em que a requisição se encontra
    const kanbanStatusList = await KanbanStatusRequisitionRepository.getMany({
      id_status_requisicao: Number(requisition.id_status_requisicao),
    });
    //baseado no quadro kanban, pega as regras de acesso para o usuário
    const accessRules = await RequisitionService.getAccessRulesByKanban(
      user,
      kanbanStatusList
    );
    //para as regras que os critérios forem atendidos, adiciona o perfil ou papel da regra a lista de papéis do usuário
    let userProfileIdList = accessRules.map((rule) => {
      if (rule.check() && rule.match(requisition, user, rule.statusList())) {
        return rule.profileId;
      }
      return null;
    });
    userProfileIdList = userProfileIdList.filter((item) => item !== null);
    // baseado nos papéis do usuário, pega as relações perfil x acao (1 ou 0) x status
    const profileActionStatusList =
      await prisma.web_perfil_acao_status_requisicao.findMany({
        where: {
          id_perfil_usuario: { in: userProfileIdList },
        },
      });
    //se pelo menos alguma relação tiver acao 1 NAQUELE status, a permissão para mudar o status é concedida
    permissionToChangeStatus = profileActionStatusList.some(
      (item) =>
        item.acao === 1 &&
        item.id_status_requisicao === Number(requisition.id_status_requisicao)
    );
    return { permissionToChangeStatus };
  }

  async getStatusAlteration(id_requisicao){
    return RequisitionStatusRepository.getStatusAlteration(id_requisicao);
  }


  async update(id_status_requisicao, data) {
    return RequisitionStatusRepository.update(id_status_requisicao, data);
  }
  async updateRequisitionStatus(id_status_requisicao, id_requisicao) {
    return RequisitionStatusRepository.updateRequisitionStatus(id_status_requisicao, id_requisicao);
  }

  async delete(id_status_requisicao) {
    return RequisitionStatusRepository.delete(id_status_requisicao);
  }
}

module.exports = new RequisitionStatusService();
