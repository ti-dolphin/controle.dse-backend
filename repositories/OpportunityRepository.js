const { prisma } = require("../database");
const ProjectRepository = require("./ProjectRepository");
const UserService = require("../services/UserService");
const { getNowISODate, formatToCurrency } = require("../utils");


class OpportunityRepository {
  static include() {
    return {
      PROJETOS: {
        include: {
          PESSOA_PROJETOS_CODGERENTEToPESSOA: true,
        },
      },
      PESSOA: {
        select: {
          NOME: true,
          CODPESSOA: true,
          EMAIL: true,
        },
      },
      ADICIONAIS: true,
      CLIENTE: true,
      STATUS: true,
    };
  }

  static format = (opportunity) => {
    const formattedOpp = {
      ...opportunity,
      projeto: opportunity.PROJETOS,
      gerente: opportunity.PROJETOS.PESSOA_PROJETOS_CODGERENTEToPESSOA,
      cliente: opportunity.CLIENTE,
      responsavel: opportunity.PESSOA,
      adicional: opportunity.ADICIONAIS,
      status: opportunity.STATUS,
      situacao: this.getSituationByInteractionDate(
        opportunity,
        opportunity.DATAINTERACAO
      ),
      VALORFATDOLPHIN_FORMATTED: formatToCurrency(opportunity.VALORFATDOLPHIN),
      VALORFATDIRETO_FORMATTED: formatToCurrency(opportunity.VALORFATDIRETO),
      VALORTOTAL_FORMATTED: formatToCurrency(opportunity.VALOR_TOTAL),
    };
    delete formattedOpp.ADICIONAIS;
    delete formattedOpp.PROJETOS;
    delete formattedOpp.PESSOA;
    return formattedOpp;
  };
  static async getById(CODOS) {
    return await prisma.oRDEMSERVICO
      .findUnique({
        where: { CODOS },
        include: this.include(),
      })
      .then((opportunity) => this.format(opportunity));
  }

  static async getStatuses() {
    return await prisma.sTATUS.findMany({
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
    const searchFilter =
      searchTerm && searchTerm.trim() !== ""
        ? this.buildSearchFilters(searchTerm)
        : {};
    const composedFilters = this.buildFilters(filters);
    let total = 0;
    let totalFatDolphin = 0;
    let totalFatDireto = 0;
    const where = {
      AND: [
        { CODTIPOOS: 21 },
        {
          PROJETOS: {
            ATIVO: 1,
            ID: UserService.isAdmin(user)
              ? {}
              : { in: projectsFollowedByUser },
          },
        },
        // Ajuste: se finalizados for true, não filtra por STATUS.ACAO, senão filtra apenas abertos
        ...(finalizados
          ? []
          : [{ STATUS: { ACAO: 0 } }]),
        searchFilter,
        composedFilters,
      ],
    };
    const opps = await prisma.oRDEMSERVICO
      .findMany({
        where: {
          AND: [
            { CODTIPOOS: 21 },
            {
              PROJETOS: {
                ATIVO: 1,
                ID: UserService.isAdmin(user)
                  ? {}
                  : { in: projectsFollowedByUser },
              },
            },
            // Ajuste: se finalizados for true, não filtra por STATUS.ACAO, senão filtra apenas abertos
            ...(finalizados ? [] : [{ STATUS: { ACAO: 0 } }]),
            searchFilter,
            composedFilters,
          ],
        },
        include: this.include(),
        orderBy: {
          ID_PROJETO: 'desc' // Default sort by project descending
        }
      })
      .then((opps) =>
        opps.map((opportunity) => {
          // Só soma no total se não for vinculada (CODOS_ORIGINAL nulo)
          if (opportunity.CODOS_ORIGINAL === null) {
            total += Number(opportunity.VALOR_TOTAL);
            totalFatDolphin += Number(opportunity.VALORFATDOLPHIN);
            totalFatDireto += Number(opportunity.VALORFATDIRETO);
          }
          return this.format(opportunity);
        })
      );

    return {
      opps,
      total,
      totalFatDolphin,
      totalFatDireto,
    };
  }

  static async create(payload, tx) {
    payload.CODTIPOOS = 21;
    payload.VALOR_COMISSAO = 0;
    payload.id_motivo_perdido = 1;
    console.log("payload", payload);
    const customer = await tx.cLIENTE.findFirst({
      where: {
        CODCLIENTE: payload.FK_CODCLIENTE,
      },
      select: {
        CODCOLIGADA: true,
      },
    });
    console.log("customer", customer);

    return await tx.oRDEMSERVICO
      .create({
        data: {
          ...payload,
          FK_CODCOLIGADA: customer.CODCOLIGADA,
        },
        include: this.include(),
      })
      .then((opportunity) => this.format(opportunity));
  }

  static async update(CODOS, payload) {
    if (payload?.user) {
      delete payload.user;
    }

    // Remove campos de data vazios ou undefined para evitar erro no Prisma
    const dateFields = [
      "DATASOLICITACAO",
      "DATAINICIO",
      "DATAENTREGA",
      "DATAINTERACAO",
      "DATAFIM",
    ];
    dateFields.forEach((field) => {
      if (
        payload[field] === "" ||
        payload[field] === undefined ||
        payload[field] === null
      ) {
        delete payload[field];
      }
    });

    // Remove campos numéricos undefined
    const numericFields = [
      "VALORFATDOLPHIN",
      "VALORFATDIRETO",
      "VALOR_COMISSAO",
    ];
    numericFields.forEach((field) => {
      if (
        payload[field] === undefined ||
        payload[field] === null ||
        payload[field] === ""
      ) {
        delete payload[field];
      }
    });

    return await prisma.oRDEMSERVICO
      .update({
        where: { CODOS },
        data: payload,
        include: this.include(),
      })
      .then((opportunity) => this.format(opportunity));
  }

  static async delete(CODOS, tx) {
    return await tx.oRDEMSERVICO.delete({
      where: { CODOS },
    });
  }

  static async getExpiredOpps() {
    const now = getNowISODate();
    const opps = await prisma.oRDEMSERVICO
      .findMany({
        where: {
          CODTIPOOS: 21,
          STATUS: { ACAO: 0 },
          DATAINTERACAO: {
            lt: now,
          },
          PROJETOS: {
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
    const closed = opp.STATUS.ACAO === 1;
    if (closed) return "fechada";
    if (expired) return "expirada";
    if (toExpire) return "expirando";
    if (!expired && !toExpire) return "ativa";
  }

  static async getToExpireOpps() {
    //wil expire in the next 5 days
    const now = new Date();
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const opps = await prisma.oRDEMSERVICO
      .findMany({
        where: {
          CODTIPOOS: 21,
          STATUS: { ACAO: 0 },
          DATAINTERACAO: {
            gte: now.toISOString(),
            lte: fiveDaysFromNow.toISOString(),
          },
          PROJETOS: {
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
      { PROJETOS: { DESCRICAO: { contains: searchTerm } } },
      { STATUS: { NOME: { contains: searchTerm } } },
      { CLIENTE: { NOMEFANTASIA: { contains: searchTerm } } },
      { NOME: { contains: searchTerm } },
      { PESSOA: { NOME: { contains: searchTerm } } },
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
        return value !== null && value !== "0" && value !== ""
          ? {
              PROJETOS: {
                ID: {
                  equals: Number(value),
                },
              },
            }
          : {};
      },
      NOME: (value) => (value ? { NOME: { contains: value } } : {}),
      cliente: (value) =>
        value ? { CLIENTE: { NOMEFANTASIA: { contains: value } } } : {},
      projeto: (value) =>
        value ? { PROJETOS: { DESCRICAO: { contains: value } } } : {},
      status: (value) =>
        value ? { STATUS: { NOME: { contains: value } } } : {},
      responsavel: (value) =>
        value ? { PESSOA: { NOME: { contains: value } } } : {},
      DATAINTERACAO_FROM: (value) => {
        return value
          ? {
              DATAINTERACAO: {
                gte: value,
              },
            }
          : {};
      },
      DATAINTERACAO_TO: (value) => {
        return value
          ? {
              DATAINTERACAO: {
                lte: value,
              },
            }
          : {};
      },
      DATASOLICITACAO_FROM: (value) => {
        return value
          ? {
              DATASOLICITACAO: {
                gte: value,
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
                gte: value,
              },
            }
          : {};
      },
      DATAINICIO_TO: (value) => {
        return value
          ? {
              DATAINICIO: {
                lte: value,
              },
            }
          : {};
      },
      DATAENTREGA_FROM: (value) => {
        return value
          ? {
              DATAENTREGA: {
                gte: value,
              },
            }
          : {};
      },
      DATAENTREGA_TO: (value) => {
        return value
          ? {
              DATAENTREGA: {
                lte: value,
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
        return value !== null && value !== "" && value !== "0"
          ? {
              ADICIONAIS: {
                NUMERO: {
                  equals: Number(value),
                },
              },
            }
          : {};
      },
    };
    const array = {};
    array.AND = [];
    const prismaFilters = Object.entries(filters).reduce(
      (acc, [key, value]) => {
        if (filterMap[key]) {
          array.AND.push(filterMap[key](value));
          return { ...acc, ...filterMap[key](value) };
        }
        return acc;
      },
      {}
    );
    return array;
  }

  static async findSimilarByProject(projectId, searchTerm, excludeCodos = null) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const words = searchTerm.trim().split(/\s+/).filter(word => word.length > 0);
    const wordConditions = words.flatMap(word => [
      { NOME: { contains: word } },
      { DESCRICAO: { contains: word } },
    ]);

    const whereClause = {
      CODTIPOOS: 21,
      ID_PROJETO: Number(projectId),
      DATASOLICITACAO: {
        gte: sixMonthsAgo,
      },
      PROJETOS: {
        ATIVO: 1,
      },
      OR: wordConditions,
    };

    // Excluir a própria proposta se estiver editando
    if (excludeCodos) {
      whereClause.CODOS = { not: Number(excludeCodos) };
    }

    const opps = await prisma.oRDEMSERVICO.findMany({
      where: whereClause,
      select: {
        CODOS: true,
        NOME: true,
        DATASOLICITACAO: true,
        CODOS_ORIGINAL: true,
        ADICIONAIS: {
          select: {
            NUMERO: true,
          },
        },
        STATUS: {
          select: {
            NOME: true,
          },
        },
        CLIENTE: {
          select: {
            NOMEFANTASIA: true,
          },
        },
      },
      take: 10,
      orderBy: {
        DATASOLICITACAO: 'desc',
      },
    });

    return opps.map((opp) => ({
      CODOS: opp.CODOS,
      NOME: opp.NOME,
      DATASOLICITACAO: opp.DATASOLICITACAO,
      CODOS_ORIGINAL: opp.CODOS_ORIGINAL,
      numeroAdicional: opp.ADICIONAIS?.NUMERO ?? 0,
      status: opp.STATUS?.NOME ?? 'N/A',
      cliente: opp.CLIENTE?.NOMEFANTASIA ?? 'N/A',
      isVinculada: opp.CODOS_ORIGINAL !== null,
    }));
  }
}

module.exports = OpportunityRepository;
