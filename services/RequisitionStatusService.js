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

  async getStatusPermission(user, requisition) {
    if (this._isAdministrator(user)) {
      return this._createAdminPermissions();
    }

    const permissionToChangeStatus = await this._calculateChangePermission(user, requisition);
    const permissionToRevertStatus = await this._calculateRevertPermission(user, requisition, permissionToChangeStatus);

    console.log(permissionToRevertStatus
      , 'permissionToRevertStatus'
    )

    return { 
      permissionToChangeStatus, 
      permissionToRevertStatus
    };
  }

  async _calculateChangePermission(user, requisition) {
    const currentStatusId = Number(requisition.id_status_requisicao);
    const userProfileIds = await this._getUserProfileIdsForCurrentStatus(user, requisition, currentStatusId);

    const profileActionStatusList = await this._fetchProfileActionsByStatus(userProfileIds, currentStatusId);

    return profileActionStatusList.some(item => item.acao === 1);
  }

  async _calculateRevertPermission(user, requisition, hasCurrentStatusPermission) {
    if (hasCurrentStatusPermission) {
      return true
    }

    const previousStatus = await this.getPreviousStatus(requisition.ID_REQUISICAO);
    
    if (!previousStatus) {
      return false;
    }

    const hasUserRole = await this._validateUserHasRoleInRequisition(user, requisition);
    if (!hasUserRole) {
      
      const currentStatusId = Number(requisition.id_status_requisicao);
      if (currentStatusId === 6 && Number(user.PERM_COMPRADOR) === 1) {
        return true;
      }
      
      return false;
    }

    const hasPreviousStatusPermission = await this._checkPermissionInPreviousStatus(user, requisition, previousStatus);
    
    // User can revert if they have permission in current status OR previous status
    const canRevertNormally = hasCurrentStatusPermission;
    const canRevertByBlock = !hasCurrentStatusPermission && hasPreviousStatusPermission;

    this._cacheRevertScenarios(requisition.ID_REQUISICAO, canRevertNormally, canRevertByBlock);

    return canRevertNormally || canRevertByBlock;
  }

  async _getUserProfileIdsForCurrentStatus(user, requisition, statusId) {
    const kanbanStatusList = await KanbanStatusRequisitionRepository.getMany({
      id_status_requisicao: statusId,
    });
    
    const accessRules = await this.getAccessRulesByKanban(user, kanbanStatusList);
    
    return accessRules
      .filter(rule => rule.check() && rule.match(requisition, user, rule.statusList()))
      .map(rule => rule.profileId);
  }

  async _fetchProfileActionsByStatus(profileIds, statusId) {
    if (profileIds.length === 0) {
      return [];
    }

    return await prisma.web_perfil_acao_status_requisicao.findMany({
      where: {
        id_perfil_usuario: { in: profileIds },
        id_status_requisicao: statusId,
      },
    });
  }

  async _validateUserHasRoleInRequisition(user, requisition) {
    const currentStatusId = Number(requisition.id_status_requisicao);
    
    const kanbanStatusList = await KanbanStatusRequisitionRepository.getMany({
      id_status_requisicao: currentStatusId,
    });

    const accessRules = await this.getAccessRulesByKanban(user, kanbanStatusList);
    
    const userRoleProfiles = accessRules
      .filter(rule => rule.check() && this.matchUserRole(requisition, user, rule.profileId))
      .map(rule => rule.profileId);

    return userRoleProfiles.length > 0;
  }

  async _checkPermissionInPreviousStatus(user, requisition, previousStatus) {
    const previousKanbanStatusList = await KanbanStatusRequisitionRepository.getMany({
      id_status_requisicao: previousStatus.id_status_requisicao,
    });
    
    const previousAccessRules = await this.getAccessRulesByKanban(user, previousKanbanStatusList);
    
    const previousUserProfileIds = previousAccessRules
      .filter(rule => {
        const hasUserRole = rule.check() && this.matchUserRole(requisition, user, rule.profileId);
        
        if (!hasUserRole) {
          return false;
        }
        
        const statusList = rule.statusList();
        return statusList === null || statusList.includes(previousStatus.id_status_requisicao);
      })
      .map(rule => rule.profileId);

    const previousProfileActionStatusList = await this._fetchProfileActionsByStatus(
      previousUserProfileIds, 
      previousStatus.id_status_requisicao
    );
    
    return previousProfileActionStatusList.some(item => item.acao === 1);
  }

  _isAdministrator(user) {
    return Number(user.PERM_ADMINISTRADOR) === 1;
  }

  _createAdminPermissions() {
    return { 
      permissionToChangeStatus: true, 
      permissionToRevertStatus: true 
    };
  }

  _cacheRevertScenarios(requisitionId, canRevertNormally, canRevertByBlock) {
    this._lastRevertScenarios = {
      canRevertNormally,
      canRevertByBlock,
      requisitionId
    };
  }

  matchUserRole(requisition, user, profileId) {
    const roleValidators = {
      1: () => true, // Administrador - always has role
      2: () => this._isRequisitante(requisition, user), // Requisitante - creator relationship
      3: () => this._isCoordenador(requisition, user), // Coordenador - project relationship
      4: () => this._isGerente(requisition, user), // Gerente - manager relationship
      5: () => false, // Diretor - global permission only, no role in requisition
      6: () => false, // Comprador - global permission only, no role in requisition
    };

    const validator = roleValidators[profileId];
    console.log(profileId, validator(), "validator");
    return validator ? validator() : false;
  }

  _isRequisitante(requisition, user) {
    return requisition.responsavel && 
           Number(requisition.responsavel.CODPESSOA) === Number(user.CODPESSOA);
  }

  _isCoordenador(requisition, user) {
    return requisition.projeto && 
           Number(requisition.projeto.ID_RESPONSAVEL) === Number(user.CODPESSOA);
  }

  _isGerente(requisition, user) {
    return requisition.gerente && 
           Number(requisition.gerente.CODPESSOA) === Number(user.CODPESSOA);
  }

  _isDiretor(user) {
    return Number(user.PERM_DIRETOR) === 1;
  }

  _isComprador(user) {
    return Number(user.PERM_COMPRADOR) === 1;
  }

  async revertToPreviousStatus(id_requisicao, user, motivo) {
    const requisition = await this._fetchAndValidateRequisition(id_requisicao);
    const previousStatus = await this._fetchAndValidatePreviousStatus(id_requisicao);
    
    await this._validateRevertPermission(user, requisition);
    
    const revertScenario = this._determineRevertScenario(id_requisicao);
    
    await this._executeRevertTransaction(id_requisicao, previousStatus, user, motivo, revertScenario);

    return this._createRevertSuccessResponse(previousStatus.id_status_requisicao);
  }

  async _fetchAndValidateRequisition(id_requisicao) {
    const requisition = await RequisitionService.getById(id_requisicao);
    
    if (!requisition) {
      throw new Error('Requisição não encontrada');
    }
    
    return requisition;
  }

  async _fetchAndValidatePreviousStatus(id_requisicao) {
    const previousStatus = await this.getPreviousStatus(id_requisicao);
    
    if (!previousStatus) {
      throw new Error('Não há status anterior para reverter');
    }
    
    return previousStatus;
  }

  async _validateRevertPermission(user, requisition) {
    const { permissionToRevertStatus } = await this.getStatusPermission(user, requisition);

    if (!permissionToRevertStatus) {
      throw new Error('Você não tem permissão para reverter ao status anterior desta requisição');
    }
  }

  _determineRevertScenario(id_requisicao) {
    const scenarios = this._lastRevertScenarios;
    
    if (!scenarios || scenarios.requisitionId !== id_requisicao) {
      return 'REVERSÃO_DESCONHECIDA';
    }

    const scenario = scenarios.canRevertNormally 
      ? 'REVERSÃO_NORMAL' 
      : scenarios.canRevertByBlock 
        ? 'REVERSÃO_POR_BLOQUEIO' 
        : 'REVERSÃO_DESCONHECIDA';
    
    delete this._lastRevertScenarios;
    
    return scenario;
  }

  async _executeRevertTransaction(id_requisicao, previousStatus, user, motivo, scenario) {
    await RequisitionStatusRepository.updateRequisitionStatus(
      previousStatus.id_status_requisicao,
      id_requisicao
    );

    await this._createRevertAuditRecord(id_requisicao, previousStatus, user, motivo, scenario);
  }

  async _createRevertAuditRecord(id_requisicao, previousStatus, user, motivo, scenario) {
    await prisma.web_alteracao_req_status.create({
      data: {
        id_requisicao: Number(id_requisicao),
        id_status_requisicao: previousStatus.id_status_requisicao,
        alterado_por: Number(user.CODPESSOA),
        data_alteracao: new Date(),
        justificativa: `[${scenario}] ${motivo || 'Status revertido'}`,
      },
    });
  }

  _createRevertSuccessResponse(previousStatusId) {
    return {
      success: true,
      message: 'Status revertido com sucesso',
      previousStatusId,
    };
  }

  async getPreviousStatus(id_requisicao) {
    const statusChanges = await prisma.web_alteracao_req_status.findMany({
      where: { id_requisicao: Number(id_requisicao) },
      orderBy: { data_alteracao: 'desc' },
    });

    if (statusChanges.length < 2) {
      return null;
    }

    return statusChanges[0];
  }

  async getStatus(id_requisicao) {
    const statusChanges = await prisma.web_alteracao_req_status.findMany({
      where: { id_requisicao: Number(id_requisicao) },
      orderBy: { data_alteracao: 'desc' },
    });

    if (statusChanges.length < 2) {
      return null;
    }

    return statusChanges[0];
  }

  async getAllLastStatuses(id_requisicao) {
    const statusChanges = await prisma.web_alteracao_req_status.findMany({
      where: { id_requisicao: Number(id_requisicao) },
      orderBy: { data_alteracao: 'desc' },
    });

    if (statusChanges.length < 2) {
      return null;
    }
    return statusChanges
  }

  async getStatusAlteration(id_requisicao) {
    return RequisitionStatusRepository.getStatusAlteration(id_requisicao);
  }

  async getAccessRulesByKanban(user, kanbanStatusList) {
    const statusByProfile = this.getStatusListByProfile(kanbanStatusList);

    return [
      this._createAdministratorRule(user),
      this._createCompradorRule(user, statusByProfile),
      this._createDiretorRule(user, statusByProfile),
      this._createGerenteRule(statusByProfile),
      this._createCoordenadorRule(statusByProfile),
      this._createRequisitanteRule(statusByProfile),
    ];
  }

  _createAdministratorRule(user) {
    return {
      check: () => this._isAdministrator(user),
      statusList: () => null,
      match: () => true,
      profileId: 1,
    };
  }

  _createCompradorRule(user, statusByProfile) {
    return {
      check: () => this._isComprador(user),
      statusList: () => statusByProfile[6],
      match: (req, user, statusList) =>
        statusList && statusList.includes(Number(req.id_status_requisicao)),
      profileId: 6,
    };
  }

  _createDiretorRule(user, statusByProfile) {
    return {
      check: () => this._isDiretor(user),
      statusList: () => statusByProfile[5],
      match: (req, user, statusList) =>
        statusList && statusList.includes(Number(req.id_status_requisicao)),
      profileId: 5,
    };
  }

  _createGerenteRule(statusByProfile) {
    return {
      check: () => true,
      statusList: () => statusByProfile[4],
      match: (req, user, statusList) =>
        this._isGerente(req, user) &&
        statusList &&
        statusList.includes(Number(req.id_status_requisicao)),
      profileId: 4,
    };
  }

  _createCoordenadorRule(statusByProfile) {
    return {
      check: () => true,
      statusList: () => statusByProfile[3],
      match: (req, user, statusList) =>
        this._isCoordenador(req, user) &&
        statusList &&
        statusList.includes(Number(req.id_status_requisicao)),
      profileId: 3,
    };
  }

  _createRequisitanteRule(statusByProfile) {
    return {
      check: () => true,
      statusList: () => statusByProfile[2],
      match: (req, user, statusList) =>
        this._isRequisitante(req, user) &&
        statusList &&
        statusList.includes(Number(req.id_status_requisicao)),
      profileId: 2,
    };
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

  async update(id_status_requisicao, data) {
    return RequisitionStatusRepository.update(id_status_requisicao, data);
  }

  async updateRequisitionStatus(id_status_requisicao, id_requisicao) {
    return RequisitionStatusRepository.updateRequisitionStatus(
      id_status_requisicao,
      id_requisicao
    );
  }

  async delete(id_status_requisicao) {
    return RequisitionStatusRepository.delete(id_status_requisicao);
  }

  async cloneStatusChanges(originalRequisitionId, newRequisitionId, tx) {
    const statusChanges = await tx.web_alteracao_req_status.findMany({
      where: { id_requisicao: originalRequisitionId },
    });

    if (statusChanges.length) {
      await tx.web_alteracao_req_status.createMany({
        data: statusChanges.map(({ id_alteracao, ...rest }) => ({
          ...rest,
          id_requisicao: newRequisitionId,
        })),
      });
    }
  }
}

module.exports = new RequisitionStatusService();
