const { prisma } = require("../database");
const { buildWhere } = require("../utils");

class CheckListRepository {
  async create(data) {
    return prisma.web_checklist_movimentacao.create({ data });
  }

  async getMany(params) {
    // Permite filtrar por id_movimentacao (movimentação) ou id_patrimonio (patrimônio via relacionamento)
    const numericFields = [
      "id_movimentacao",
      { movimentacao_patrimonio: "id_patrimonio" },
    ];
    const where = buildWhere(params, numericFields);
    console.log('where: ', where)
    return prisma.web_checklist_movimentacao
      .findMany({
        where,
        include: {
          movimentacao_patrimonio: {
            include: {
              pessoa: {
                select: {
                  CODPESSOA: true,
                  NOME: true,
                },
              },
              web_patrimonio: true,
            },
          },
        },
      })
      .then((results) =>
        results.map((result) => {
          const formatted = {
            ...result,
            responsavel: result.movimentacao_patrimonio?.pessoa || null,
            patrimonio: result.movimentacao_patrimonio?.web_patrimonio || null,
          };
          delete formatted.movimentacao_patrimonio.pessoa;
          delete formatted.movimentacao_patrimonio.web_patrimonio;
          delete formatted.movimentacao_patrimonio;
          return formatted;
        })
      );
  }

  async getById(id_checklist_movimentacao) {
    return prisma.web_checklist_movimentacao
      .findUnique({
        where: { id_checklist_movimentacao },
        include: {
          movimentacao_patrimonio: {
            include: {
              pessoa: {
                select: {
                  CODPESSOA: true,
                  NOME: true,
                },
              },
              web_patrimonio: true,
            },
          },
        },
      })
      .then((result) => {
        if (!result) return null;
        const formatted = {
          ...result,
          responsavel: result.movimentacao_patrimonio?.pessoa || null,
          patrimonio: result.movimentacao_patrimonio?.web_patrimonio || null,
        };
        delete formatted.movimentacao_patrimonio.pessoa;
        delete formatted.movimentacao_patrimonio.web_patrimonio;
        delete formatted.movimentacao_patrimonio;
        return formatted;
      });
  }

  async update(id_checklist_movimentacao, data) {
    return prisma.web_checklist_movimentacao.update({
      where: { id_checklist_movimentacao },
      data,
    });
  }

  async delete(id_checklist_movimentacao) {
    return prisma.web_checklist_movimentacao.delete({
      where: { id_checklist_movimentacao },
    });
  }
}

module.exports = new CheckListRepository();
