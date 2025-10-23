const { prisma } = require("../database");
const { getNowISODate } = require("../utils");
const ChecklistMovementationItemRepository = require("./ChecklistMovementationItemRepository");
const PatrimonyRepository = require("./PatrimonyRepository");

const filterFieldMap = {
  id_checklist_movimentacao: "id_checklist_movimentacao",
  patrimonio_nome: "patrimonio_nome",
  responsavel_nome: "responsavel_nome",
  realizado: "realizado",
  aprovado: "aprovado",
  data_realizado: "data_realizado",
  data_aprovado: "data_aprovado",
};

class CheckListRepository {
  include = {
    movimentacao_patrimonio: {
      include: {
        pessoa: {
          select: {
            CODPESSOA: true,
            NOME: true,
            EMAIL: true,
          },
        },
        web_patrimonio: {
          include: {
            web_tipo_patrimonio: {
              include: {
                web_items_checklist_tipo: true,
              },
            },
          },
        },
      },
    },
    web_items_checklist_movimentacao: true,
  };
  format = (result) => {
    const formatted = {
      ...result,
      responsavel: result.movimentacao_patrimonio?.pessoa || null,
      patrimonio: result.movimentacao_patrimonio?.web_patrimonio || null,
      patrimonio_nome:
        result.movimentacao_patrimonio?.web_patrimonio.nome || null,
      responsavel_nome: result.movimentacao_patrimonio?.pessoa.NOME || null,
      items: result.web_items_checklist_movimentacao
        ? result.web_items_checklist_movimentacao
        : [],
    };
    formatted.patrimonio.tipo_patrimonio =
      formatted.patrimonio.web_tipo_patrimonio;
    delete formatted.movimentacao_patrimonio.pessoa;
    delete formatted.movimentacao_patrimonio.web_patrimonio;
    delete formatted.movimentacao_patrimonio;
    return formatted;
  };

  async create(id_movimentacao, tx) {
    const checklist = await tx.web_checklist_movimentacao
      .create({
        data: {
          id_movimentacao,
          data_criacao: getNowISODate(),
          aprovado: false,
          realizado: false,
        },
        include: this.include,
      })
      .then((result) => (result ? this.format(result) : null));
    const items =
      await ChecklistMovementationItemRepository.getItemsFromTypeOfPatrimony(
        checklist.id_movimentacao,
        tx
      );

    const createdChecklistItems = [];
    for (const item of items) {
      const { nome_item_checklist } = item;
      const itemCreated = await tx.web_items_checklist_movimentacao.create({
        data: {
          id_checklist_movimentacao: checklist.id_checklist_movimentacao,
          nome_item_checklist,
        },
      });
      createdChecklistItems.push(itemCreated);
    }

    return checklist;
  }

  async getMany(params, filters, searchTerm) {
    const searchFilter =
      searchTerm !== "" ? this.buildSearchFilters(searchTerm) : {};
    const extraFilters = this.buildFilters(filters);

    return prisma.web_checklist_movimentacao
      .findMany({
        where: {
          ...params,
          AND: [searchFilter, extraFilters],
        },
        orderBy: { id_checklist_movimentacao: "desc" },
        include: this.include,
      })
      .then((results) => results.map(this.format));
  }

  async getManyByUser(codpessoa, filters, searchTerm, situacao) {
    const searchFilter =
      searchTerm !== "" ? this.buildSearchFilters(searchTerm) : {};
    const extraFilters = this.buildFilters(filters);
    const typesUserIsResponsableFor =
      await PatrimonyRepository.getTypesUserIsResponsableFor(codpessoa, true);

    const situationFilter = this.buildSituationFilters(
      situacao,
      typesUserIsResponsableFor,
      codpessoa
    );

    console.log("situationFilter", situationFilter);

    return prisma.web_checklist_movimentacao
      .findMany({
        where: {
          ...situationFilter,
          AND: [searchFilter, extraFilters],
        },
        include: this.include,
      })
      .then((results) => results.map(this.format));
  }

  async getById(id_checklist_movimentacao) {
    const checklist = await prisma.web_checklist_movimentacao
      .findUnique({
        where: { id_checklist_movimentacao },
        include: {
          ...this.include,
          web_items_checklist_movimentacao: true,
        },
      })
      .then((result) => (result ? this.format(result) : null));

    return checklist;
  }

  async getFinishedExpiredChecklists() {
    const patrimonies = await prisma.web_patrimonio.findMany({
      where: { ativo: 1 }, // Opcional: apenas ativos
      include: {
        web_tipo_patrimonio: true,
        web_movimentacao_patrimonio: {
          orderBy: { id_movimentacao: "desc" }, // Última movimentação primeiro
          include: {
            web_checklist_movimentacao: {
              orderBy: { id_checklist_movimentacao: "desc" }, // Último checklist primeiro
            },
          },
        },
      },
    });
    // Processa para extrair apenas o último de cada
    const checklists = patrimonies.map((patrimonio) => {
      const lastMov = patrimonio.web_movimentacao_patrimonio[0]; // Primeiro é o último (devido orderBy desc)
      if (!lastMov) {
        return {
          id_patrimonio: patrimonio.id_patrimonio,
          nome: patrimonio.nome,
          lastChecklist: null,
        };
      }
      const lastChecklist = lastMov.web_checklist_movimentacao[0]; // Similar
      return {
        ...lastChecklist,
        periodicidade: patrimonio.web_tipo_patrimonio.periodicidade,
      };
    });

    const expireds = checklists.filter((checklist) =>
      this.isExpired(checklist, checklist.periodicidade)
    );
    return expireds;
  }

  async getChecklistsWithoutItems() {
    const checklists = await prisma.web_checklist_movimentacao
      .findMany({
        where: {
          realizado: false,
          aprovado: false,
        },
        include: this.include,
      })
      .then((results) => results.map(this.format));
    return checklists.filter((checklist) => !(checklist.items.length > 0));
  }

  async getUndoneChecklists() {
    const checklists = await prisma.web_checklist_movimentacao
      .findMany({
        where: {
          realizado: false,
          aprovado: false,
        },
        include: this.include,
      })
      .then((results) => results.map(this.format));
    return checklists;
  }

  async update(id_checklist_movimentacao, data) {
    return prisma.web_checklist_movimentacao
      .update({
        where: { id_checklist_movimentacao },
        data,
        include: this.include,
      })
      .then((result) => (result ? this.format(result) : null));
  }

  async approve(id_checklist_movimentacao) {
    return prisma.web_checklist_movimentacao
      .update({
        where: { id_checklist_movimentacao },
        data: {
          aprovado: true,
          realizado: true,
          data_aprovado: getNowISODate(),
        },
        include: this.include,
      })
      .then((result) => (result ? this.format(result) : null));
    ;
  }

  isExpired(checklist, periodicidade) {
    const now = new Date();
    if (checklist.realizado && checklist.aprovado) {
      // Assumindo que 'now' está definido como new Date();
      const approvalDate = new Date(checklist.data_aprovado); // Converte a data de aprovação para Date
      // Calcula a diferença em milissegundos entre agora e a data de aprovação
      const differenceInMilliseconds = now - approvalDate;
      // Converte para dias (arredondando para baixo)
      const differenceInDays = Math.floor(
        differenceInMilliseconds / (1000 * 60 * 60 * 24)
      );
      // Verifica se a diferença é MAIOR que a periodicidade (expirado)
      if (differenceInDays > periodicidade) {
        return true;
      }
    }
    return false;
  }

  async delete(id_checklist_movimentacao) {
    return prisma.web_checklist_movimentacao.delete({
      where: { id_checklist_movimentacao },
      include: this.include,
    });
  }

  buildFilters(filters) {
    // Mapeamento de filtros para a sintaxe do Prisma
    if (!filters) return {};
    const filterMap = {
      id_checklist_movimentacao: (value) => ({
        id_checklist_movimentacao: isNaN(value)
          ? {}
          : { equals: Number(value) },
      }),
      patrimonio_nome: (value) => ({
        movimentacao_patrimonio: {
          web_patrimonio: { nome: { contains: value } },
        },
      }),
      responsavel_nome: (value) => ({
        movimentacao_patrimonio: { pessoa: { NOME: { contains: value } } },
      }),
      realizado: (value) => ({ realizado: { equals: value } }),
      aprovado: (value) => ({ aprovado: { equals: value } }),
      data_realizado: (value) => {
        const date = new Date(value);
        const nextDay = new Date(date.setDate(date.getDate() + 1));
        const nextDayISO = nextDay.toISOString();
        const previousDay = new Date(date.setDate(date.getDate() - 1));
        const previousDayISO = previousDay.toISOString();
        return {
          AND: [
            { data_realizado: { gte: previousDayISO } },
            { data_realizado: { lte: nextDayISO } },
          ],
        };
      },
      data_aprovado: (value) => {
        const date = new Date(value);
        const nextDay = new Date(date.setDate(date.getDate() + 1));
        const nextDayISO = nextDay.toISOString();
        const previousDay = new Date(date.setDate(date.getDate() - 1));
        const previousDayISO = previousDay.toISOString();
        return {
          AND: [
            { data_aprovado: { gte: previousDayISO } },
            { data_aprovado: { lte: nextDayISO } },
          ],
        };
      },
    };
    // Transforma cada filtro do objeto recebido
    const prismaFilters = Object.entries(filters).map(([key, value]) => {
      if (filterMap[key]) {
        return filterMap[key](value);
      }
      return {}; // Ignora filtros inválidos
    });

    // Retorna os filtros combinados com AND
    return { AND: prismaFilters };
  }

  buildSearchFilters(searchTerm) {
    return {
      OR: [
        {
          movimentacao_patrimonio: {
            web_patrimonio: { nome: { contains: searchTerm } },
          },
        },
        {
          movimentacao_patrimonio: {
            pessoa: { NOME: { contains: searchTerm } },
          },
        },
      ],
    };
  }

  buildSituationFilters(situacao, typesUserIsResponsableFor, codpessoa) {
    const situationFilters = {
      aprovar: {
        aprovado: false,
        realizado: true,
        movimentacao_patrimonio: {
          web_patrimonio: {
            tipo: { in: typesUserIsResponsableFor },
          },
        },
      },
      cobrar: {
        aprovado: false,
        realizado: false,
        movimentacao_patrimonio: {
          id_responsavel: {
            not: Number(codpessoa),
          },
          web_patrimonio: {
            tipo: { in: typesUserIsResponsableFor },
          },
        },
      },
      pendente: {
        aprovado: false,
        realizado: false,
        movimentacao_patrimonio: {
          id_responsavel: Number(codpessoa),
        },
      },
      todas: {
        OR: [{ aprovado: false }, { realizado: false }],
        movimentacao_patrimonio: {
          web_patrimonio: {
            tipo: { in: typesUserIsResponsableFor },
          },
        },
      },
    };
    const situationFilter = situationFilters[situacao] ?? {};
    return situationFilter;
  }
}

module.exports = new CheckListRepository();

