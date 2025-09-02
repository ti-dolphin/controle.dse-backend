const { prisma } = require("../database");

class RequisitionStatusRepository {
  async create(data) {
    return prisma.web_status_requisicao.create({ data });
  }

  async getMany(params) {
    const {id_requisicao} = params;
    const req = await prisma.web_requisicao.findFirst({
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
    const alterationsWithTransition = alterations.map((alteration) => {
      const transition = transitions.find(
        (transition) =>
          transition.id_status_anterior === alteration.id_status_anterior &&
          transition.id_status_requisicao === alteration.id_status_requisicao
      );
      alteration.transicao = transition;
      return alteration;
    });
    return alterations;
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
    return prisma.web_requisicao.update({
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
