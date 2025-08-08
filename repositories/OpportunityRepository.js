const { prisma } = require("../database");
const ProjectRepository = require("./ProjectRepository");
const UserService = require("../services/UserService");
const { getNowISODate, formatToCurrency } = require("../utils");


class OpportunityRepository {
  static include() {
    return {
      projetos: {
        include: {
          pessoa: true,
        },
      },
      pessoa: {
        select: {
          NOME: true,
          CODPESSOA: true,
          EMAIL: true,
        },
      },
      adicionais: true,
      cliente: true,
      status: true,
    };
  }

  static format = (opportunity) => {
    const formattedOpp = {
      ...opportunity,
      projeto: opportunity.projetos,
      gerente: opportunity.projetos.pessoa,
      responsavel: opportunity.pessoa,
      adicional: opportunity.adicionais,
      situacao: this.getSituationByInteractionDate(opportunity.DATAINTERACAO),
      VALORFATDOLPHIN_FORMATTED:  formatToCurrency(opportunity.VALORFATDOLPHIN),
      VALORFATDIRETO_FORMATTED: formatToCurrency(opportunity.VALORFATDIRETO),
      VALORTOTAL_FORMATTED: formatToCurrency(opportunity.VALOR_TOTAL),
    };
    delete formattedOpp.adicionais;
    delete formattedOpp.projetos;
    delete formattedOpp.pessoa;
    return formattedOpp;
  };
  static async getById(CODOS) {
    return await prisma.ordemservico
      .findUnique({
        where: { CODOS },
        include: this.include(),
      })
      .then((opportunity) => this.format(opportunity));
  }

  static async getStatuses() {
    return await prisma.status.findMany({
      where: {
        ATIVO: true,
      },
    });
  }

  static async getMany(user, searchTerm, filters, finalizados) {
    let projectsFollowedByUser =
      await ProjectRepository.getProjectsFollowedByUser(user.CODPESSOA);
    projectsFollowedByUser = projectsFollowedByUser.map(
      (project) => project.ID
    );
    const opps = await prisma.ordemservico
      .findMany({
        where: {
          AND: [
            { CODTIPOOS: 21 },
            {
              projetos: {
                ATIVO: 1,
                ID: UserService.isAdmin(user)
                  ? {}
                  : { in: projectsFollowedByUser },
              },
            },
            { status: { ACAO: finalizados ? 0 : 1 } },
            {
              OR: [
                { projetos: { DESCRICAO: { contains: searchTerm } } },
                {
                  projetos: { pessoa: { NOME: { contains: searchTerm } } },
                },
                { status: { NOME: { contains: searchTerm } } },
                { cliente: { NOMEFANTASIA: { contains: searchTerm } } },
                { NOME: { contains: searchTerm } },
                { pessoa: { NOME: { contains: searchTerm } } },
              ],
            },
            {
              AND: filters.length > 0 ? filters : {},
            },
          ],
        },
        include: this.include(),
      })
      .then((opps) => opps.map((opportunity) => this.format(opportunity)));

    return opps;
  }

  static async create(payload) {
    payload.CODTIPOOS = 21;
    payload.VALOR_COMISSAO = 0;
    payload.id_motivo_perdido = 1;
    return await prisma.ordemservico
      .create({
        data: payload,
        include: this.include(),
      })
      .then((opportunity) => this.format(opportunity));
  }

  static async update(CODOS, payload) {
    return await prisma.ordemservico
      .update({
        where: { CODOS },
        data: payload,
        include: this.include(),
      })
      .then((opportunity) => this.format(opportunity));
  }

  static async delete(CODOS) {
    return await prisma.ordemservico.delete({
      where: { CODOS },
    });
  }

  static async  getExpiredOpps(){ 
      const now = getNowISODate();
      const opps = await prisma.ordemservico.findMany({ 
        where: { 
          CODTIPOOS: 21,
          status: {ACAO : 0},
          DATAINTERACAO: {
            lt: now
          },
          projetos: { 
            ATIVO: 1
          }
        },
        include: this.include()
      }).then((opps) => opps.map((opportunity) => this.format(opportunity)));
      return opps;
  };


  static getSituationByInteractionDate(date) {
    const dateReceived = new Date(date);
    const now = new Date();
    const fiveDaysFromNow = new Date(
          now.getTime() + 5 * 24 * 60 * 60 * 1000
        );
    const expired = dateReceived < now;
    const toExpire = dateReceived > now && dateReceived < fiveDaysFromNow;
    if(expired) return 'expirada';
    if(toExpire) return 'expirando';
    if(!expired && !toExpire) return 'ativa';
  } 

  static async getToExpireOpps( ){ 
    //wil expire in the next 5 days
    const now = new Date();
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const opps = await prisma.ordemservico
      .findMany({
        where: {
          CODTIPOOS: 21,
          status: { ACAO: 0 },
          DATAINTERACAO: {
            gte: now.toISOString(),
            lte: fiveDaysFromNow.toISOString(),
          },
          projetos: {
            ATIVO: 1,
          },
        },
        include: this.include(),
      })
      .then((opps) => opps.map((opportunity) => this.format(opportunity)));
    return opps;
  }
}

module.exports = OpportunityRepository;
