const { prisma } = require("../database");

class MovementationRepository {
  async create(payload) {
    return await prisma.web_movimentacao_patrimonio.create({ data: payload });
  }

  async getMany(params) {
    return await prisma.web_movimentacao_patrimonio
      .findMany({
        where: params,
        include: {
          web_patrimonio: true,
          projetos: {
            include: {
              pessoa: {
                select: {
                  CODPESSOA: true,
                  NOME: true,
                },
              },
            },
          },
          pessoa: {
            select: {
              CODPESSOA: true,
              NOME: true,
            },
          },
        },
      })
      .then((movimentacoes) =>
        movimentacoes.map((movimentacao) => {
          const formattedMovimentacao = {
            ...movimentacao,
            responsavel: movimentacao.pessoa,
            projeto: movimentacao.projetos,
            patrimonio: movimentacao.web_patrimonio,
            gerente: movimentacao.projetos.pessoa,
          };
          delete formattedMovimentacao.pessoa;
          delete formattedMovimentacao.projetos;
          delete formattedMovimentacao.web_patrimonio;
          delete formattedMovimentacao.projeto.pessoa;
          return formattedMovimentacao;
        })
      );
  }

  async getById(id_movimentacao) {
    return await prisma.web_movimentacao_patrimonio
      .findUnique({
        where: { id_movimentacao },
        include: {
          web_patrimonio: true,
          projetos: {
            include: {
              pessoa: {
                select: {
                  CODPESSOA: true,
                  NOME: true,
                },
              },
            },
          },
          pessoa: {
            select: {
              CODPESSOA: true,
              NOME: true,
            },
          },
        },
      })
      .then((movimentacao) => {
        const formattedMovimentacao = {
          ...movimentacao,
          responsavel: movimentacao.pessoa,
          projeto: movimentacao.projetos,
          patrimonio: movimentacao.web_patrimonio,
          gerente: movimentacao.projetos.pessoa,
        };
        delete formattedMovimentacao.pessoa;
        delete formattedMovimentacao.projetos;
        delete formattedMovimentacao.web_patrimonio;
        delete formattedMovimentacao.projeto.pessoa;
        return formattedMovimentacao;
      });
  }

  async update(id_movimentacao, payload) {
    return await prisma.web_movimentacao_patrimonio.update({
      where: { id_movimentacao },
      data: payload,
    });
  }

  async delete(id_movimentacao) {
    return await prisma.web_movimentacao_patrimonio.delete({
      where: { id_movimentacao },
    });
  }
}
module.exports = new MovementationRepository();
