const { prisma } = require("../database");

class RequisitionStatusRepository {
  async create(data) {
    return prisma.web_status_requisicao.create({ data });
  }

  async getMany(params) {
    const {id_requisicao} = params;
    const req = await prisma.wEB_REQUISICAO.findFirst({
      where: { ID_REQUISICAO: Number(id_requisicao) },
    });

    const scope = await prisma.web_escopo_requisicao.findFirst({
      where : { 
        id_escopo_requisicao : req.id_escopo_requisicao
      }
    });
   
    params.id_escopo_requisicao = Number(scope.id_escopo_requisicao);
    return await prisma.web_status_requisicao.findMany({ where: { 
      id_escopo_requisicao : params.id_escopo_requisicao
    }});
  }

  async getStatusAlteration(id_requisicao){
    // Busca a requisição com os relacionamentos necessários para determinar responsáveis
    const requisition = await prisma.wEB_REQUISICAO.findUnique({
      where: { ID_REQUISICAO: id_requisicao },
      include: {
        PESSOA_WEB_REQUISICAO_ID_RESPONSAVELToPESSOA: {
          select: { CODPESSOA: true, NOME: true }
        },
        PROJETOS: {
          include: {
            PESSOA_PROJETOS_ID_RESPONSAVELToPESSOA: {
              select: { CODPESSOA: true, NOME: true }
            },
            PESSOA_PROJETOS_CODGERENTEToPESSOA: {
              select: { CODPESSOA: true, NOME: true }
            }
          }
        }
      }
    });

    const alterations = await prisma.web_alteracao_req_status
      .findMany({
        where: { id_requisicao },
        orderBy: { data_alteracao: "desc" },
        include: {
          pessoa: {
            select: {
              CODPESSOA: true,
              NOME: true,
            },
          },
        },
      })
      .then((alterations) =>
        alterations.map((alteration) => {
          const formattedAlteration = {
            ...alteration,
            pessoa_alterado_por: alteration.pessoa,
          };
          delete formattedAlteration.pessoa;
          return formattedAlteration;
        })
      );
    const id_status_anterior_list = alterations.map(
      (alteration) => alteration.id_status_anterior
    );
    const id_status_requisicao_list = alterations.map(
      (alteration) => alteration.id_status_requisicao
    );
    const transitions = await prisma.web_transicao_status.findMany({
      where: {
        AND: [
          { id_status_anterior: { in: id_status_anterior_list } },
          { id_status_requisicao: { in: id_status_requisicao_list } },
        ],
      },
    });
    
    // Busca os perfis responsáveis por cada status
    const kanbanStatusList = await prisma.web_kanban_status_requisicao.findMany({
      where: {
        id_status_requisicao: { in: id_status_requisicao_list },
        id_kanban_requisicao: 1 // "A Fazer" - indica quem deve agir no status
      }
    });

    const alterationsWithTransition = alterations.map((alteration) => {
      const transition = transitions.find(
        (transition) =>
          transition.id_status_anterior === alteration.id_status_anterior &&
          transition.id_status_requisicao === alteration.id_status_requisicao
      );
      alteration.transicao = transition;
      
      // Determina a pessoa responsável pelo novo status
      const kanbanStatus = kanbanStatusList.find(
        k => k.id_status_requisicao === alteration.id_status_requisicao
      );
      
      if (kanbanStatus && requisition) {
        const responsavel = this._getResponsavelByPerfil(kanbanStatus.perfil, requisition);
        alteration.pessoa_destino = responsavel;
        alteration.perfil_destino = kanbanStatus.nome_perfil;
      }
      
      return alteration;
    });
    return alterationsWithTransition;
  }

  /**
   * Mapeia o perfil para a pessoa responsável na requisição
   * @param {string} perfil - ID do perfil (1=Admin, 2=Requisitante, 3=Coordenador, 4=Gerente, 5=Diretor, 6=Comprador, 7=Estoquista)
   * @param {object} requisition - Requisição com relacionamentos carregados
   */
  _getResponsavelByPerfil(perfil, requisition) {
    const perfilId = Number(perfil);
    
    switch (perfilId) {
      case 2: // Requisitante
        return requisition.PESSOA_WEB_REQUISICAO_ID_RESPONSAVELToPESSOA || null;
      case 3: // Coordenador
        return requisition.PROJETOS?.PESSOA_PROJETOS_ID_RESPONSAVELToPESSOA || null;
      case 4: // Gerente
        return requisition.PROJETOS?.PESSOA_PROJETOS_CODGERENTEToPESSOA || null;
      case 5: // Diretor - permissão global, não há pessoa específica
      case 6: // Comprador - permissão global, não há pessoa específica
      case 7: // Estoquista - permissão global, não há pessoa específica
      case 1: // Administrador - permissão global
      default:
        return null;
    }
  }

  async getById(id_status_requisicao) {
    return prisma.web_status_requisicao.findUnique({
      where: { id_status_requisicao },
    });
  }

  async update(id_status_requisicao, data) {
    return prisma.web_status_requisicao.update({
      where: { id_status_requisicao },
      data,
    });
  }
  async updateRequisitionStatus(id_status_requisicao, id_requisicao) {
    return prisma.wEB_REQUISICAO.update({
      where: { id_requisicao },
      data: { id_status_requisicao },
    });
  }

  async delete(id_status_requisicao) {
    return prisma.web_status_requisicao.delete({
      where: { id_status_requisicao },
    });
  }
}

module.exports = new RequisitionStatusRepository();
