const { prisma } = require("../database");
const { buildWhere } = require("../utils");
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
          },
        },
        web_patrimonio: { 
          include : {
            web_tipo_patrimonio : true
          }
        },
      },
    },
  };
  format = (result) => {
    const formatted = {
      ...result,
      responsavel: result.movimentacao_patrimonio?.pessoa || null,
      patrimonio: result.movimentacao_patrimonio?.web_patrimonio || null,
      patrimonio_nome: result.movimentacao_patrimonio?.web_patrimonio.nome || null,
      responsavel_nome: result.movimentacao_patrimonio?.pessoa.NOME || null,
      items : result.web_items_checklist_movimentacao ?  result.web_items_checklist_movimentacao : []
    };
    formatted.patrimonio.tipo_patrimonio = formatted.patrimonio.web_tipo_patrimonio;
    delete formatted.movimentacao_patrimonio.pessoa;
    delete formatted.movimentacao_patrimonio.web_patrimonio;
    delete formatted.movimentacao_patrimonio;
    return formatted;
  };

  async create(data) {
    return prisma.web_checklist_movimentacao
      .create({ data })
      .then((result) => (result ? this.format(result) : null));
  }

  async getMany(params, filters, searchTerm) {
    const searchFilter = searchTerm !== "" ? this.buildSearchFilters(searchTerm) : {};
    const extraFilters = this.buildFilters(filters);

    return prisma.web_checklist_movimentacao
      .findMany({
        where: {
          ...params,
          AND: [searchFilter, extraFilters],
        },
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
    const checklist =  await prisma.web_checklist_movimentacao
      .findUnique({
        where: { id_checklist_movimentacao },
        include: {
          ...this.include,
          web_items_checklist_movimentacao: true,
        },
      })
      .then((result) => (result ? this.format(result) : null));

    return checklist
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
        { movimentacao_patrimonio: { web_patrimonio: { nome: { contains: searchTerm } } } },
        { movimentacao_patrimonio: { pessoa: { NOME: { contains: searchTerm } } } },
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
    };
    const situationFilter = situationFilters[situacao] ?? {};
    return situationFilter;
  }
}

module.exports = new CheckListRepository();

