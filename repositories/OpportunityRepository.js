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
      situacao: this.getSituationByInteractionDate(opportunity ,opportunity.DATAINTERACAO),
      VALORFATDOLPHIN_FORMATTED: formatToCurrency(opportunity.VALORFATDOLPHIN),
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
    const searchFilter = searchTerm && searchTerm.trim() !== "" ? this.buildSearchFilters(searchTerm) : {};
    const composedFilters = this.buildFilters(filters);
    let total = 0;
    let totalFatDolphin = 0;
    let totalFatDireto = 0;
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
            { status: { ACAO: finalizados ? 1 : 0 } },
            searchFilter,
            composedFilters,
          ],
        },
        include: this.include(),
      })
      .then((opps) => opps.map((opportunity) => { 
        total += Number(opportunity.VALOR_TOTAL);
        totalFatDolphin += Number(opportunity.VALORFATDOLPHIN);
        totalFatDireto += Number(opportunity.VALORFATDIRETO);
        return  this.format(opportunity);
      }));

    return {
      opps,
      total,
      totalFatDolphin,
      totalFatDireto,
    };
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

  static async getExpiredOpps() {
    const now = getNowISODate();
    const opps = await prisma.ordemservico
      .findMany({
        where: {
          CODTIPOOS: 21,
          status: { ACAO: 0 },
          DATAINTERACAO: {
            lt: now,
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

  static getSituationByInteractionDate(opp, date) {
    const dateReceived = new Date(date);
    const now = new Date();
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const expired = dateReceived < now;
    const toExpire = dateReceived > now && dateReceived < fiveDaysFromNow;
    const closed = opp.status.ACAO === 1;
    if(closed) return "fechada";
    if (expired) return "expirada";
    if (toExpire) return "expirando";
    if (!expired && !toExpire) return "ativa";
  }

  static async getToExpireOpps() {
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

  static buildSearchFilters(searchTerm) {
    const searchFilters = [
      { projetos: { DESCRICAO: { contains: searchTerm } } },
      { projetos: { pessoa: { NOME: { contains: searchTerm } } } },
      { status: { NOME: { contains: searchTerm } } },
      { cliente: { NOMEFANTASIA: { contains: searchTerm } } },
      { NOME: { contains: searchTerm } },
      { pessoa: { NOME: { contains: searchTerm } } },
    ];

    return {
      OR: searchFilters,
    };
  }

  static buildFilters(filters) {
    if (!filters) return {};

    const filterMap = {
      CODOS: (value) => {
        return value !== null
          ? {
              CODOS: {
                equals: Number(value),
              },
            }
          : {};
      },
      ID_PROJETO: (value) => {
        console.log(value);
        return value !== null && value !== '0' && value !== ''
          ? {
              projetos: {
                ID: {
                  equals: Number(value),
                },
              },
            }
          : {};
      },
      NOME: (value) => (value ? { NOME: { contains: value } } : {}),
      cliente: (value) => (value ? { cliente: { NOMEFANTASIA: { contains: value } } } : {}),
      projeto: (value) => (value ? { projetos: { DESCRICAO: { contains: value } } } : {}),
      status: (value) => (value ? { status: { NOME: { contains: value } } } : {}),
      responsavel: (value) => (value ? { pessoa: { NOME: { contains: value } } } : {}),
      DATASOLICITACAO_FROM: (value) => {
        return value
          ? {
              DATASOLICITACAO: {
                gte:value,
              },
            }
          : {};
      },
      DATASOLICITACAO_TO: (value) => {
        return value
          ? {
              DATASOLICITACAO: {
                lte: value,
              },
            }
          : {};
      },
      DATAINICIO_FROM: (value) => {
        return value
          ? {
              DATAINICIO: {
                gte:value,
              },
            }
          : {};
      },
      DATAINICIO_TO: (value) => {
        return value
          ? {
              DATAINICIO: {
                lte:value,
              },
            }
          : {};
      },
      DATAENTREGA_FROM: (value) => {
        return value
          ? {
              DATAENTREGA: {
                gte:value,
              },
            }
          : {};
      },
      DATAENTREGA_TO: (value) => {
        return value
          ? {
              DATAENTREGA: {
                lte:value,
              },
            }
          : {};
      },
      VALOR_TOTAL_gte: (value) => {
        return value !== null
          ? {
              VALOR_TOTAL: {
                gte: Number(value),
              },
            }
          : {};
      },
      VALOR_TOTAL_lte: (value) => {
        return value !== null
          ? {
              VALOR_TOTAL: {
                lte: Number(value),
              },
            }
          : {};
      },
      adicional: (value) => {
        return value !== null && value !== '' && value !== '0'
          ? {
              adicionais: {
                NUMERO: {
                  equals: Number(value),
                },
              },
            }
          : {};
      },
    };
    const array = {};
    array.AND = []
    const prismaFilters =  Object.entries(filters).reduce((acc, [key, value]) => {
      if (filterMap[key]) {
        array.AND.push(filterMap[key](value));
        return { ...acc, ...filterMap[key](value) };
      }
      return acc;
    }, {});
        return array;
  }
}

module.exports = OpportunityRepository;
