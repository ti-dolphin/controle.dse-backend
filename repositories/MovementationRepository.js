const { prisma } = require("../database");
const {getNowISODate} = require('../utils');

class MovementationRepository {
  async create(payload, tx) {
    payload.data = getNowISODate();
    return await tx.web_movimentacao_patrimonio
      .create({ data: payload, include: this._includeObject() })
      .then((movimentation) => this._formatMovimentacao(movimentation));
  }

  async getMany(search, filters, id_patrimonio, from) {
    let searchFilter = {};
    let composedFilters = {};
    if (search && search.trim() !== "") {
      searchFilter = {
        OR: [
          { web_patrimonio: { nserie: { contains: search } } },
          { web_patrimonio: { nome: { contains: search } } },
          {
            web_patrimonio: {
              web_tipo_patrimonio: { nome_tipo: { contains: search } },
            },
          },
          { web_patrimonio: { descricao: { contains: search } } },
          { pessoa: { NOME: { contains: search } } },
          { projetos: { DESCRICAO: { contains: search } } },
          {
            projetos: {
              PESSOA_PROJETOS_CODGERENTEToPESSOA: {
                NOME: { contains: search },
              },
            },
          },
        ],
      };
    }
    if (filters && filters.length > 0) {
      composedFilters = { AND: filters };
    }
    let movs = await prisma.web_movimentacao_patrimonio
      .findMany({
        // where: {

        //   AND: [searchFilter, composedFilters],
        // },
        include: this._includeObject(),
        orderBy: [
          { data: "desc" }, // Primary: Most recent date first (globally)
          { id_movimentacao: "desc" }, // Secondary: For ties on date, take the highest ID (most recent insertion)
          // Remove { id_patrimonio: "desc" } unless you have a specific reason for sorting patrimonios when dates/IDs tie
        ],
      })
      .then((movimentacoes) => movimentacoes.map(this._formatMovimentacao));
     

    if (from === "patrimonios") {
      const mostRecenetMovByPatrimonyId = new Map();
      movs.forEach((mov) => {
        if (!mostRecenetMovByPatrimonyId.has(mov.id_patrimonio)) {
          mostRecenetMovByPatrimonyId.set(mov.id_patrimonio, mov);
        }
      });
      movs = Array.from(mostRecenetMovByPatrimonyId.values());
      movs = await prisma.web_movimentacao_patrimonio
        .findMany({
          where: {
            id_movimentacao: {
              in: movs.map((mov) => mov.id_movimentacao),
            },
            AND: [searchFilter, composedFilters],
          },
          include: this._includeObject(),
          orderBy: [
            {id_patrimonio: 'desc'}
          ]
        }).then((movimentacoes) => movimentacoes.map(this._formatMovimentacao));
    }

    if(from === 'movimentacoes') {
        movs = movs.filter(mov => mov.id_patrimonio === Number(id_patrimonio));
    }
    console.log("movs: ", movs)
    return movs;
  }

  async getById(id_movimentacao) {
    return await prisma.web_movimentacao_patrimonio
      .findUnique({
        where: { id_movimentacao },
        include: this._includeObject(),
      })
      .then(this._formatMovimentacao);
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

  _includeObject() {
    return {
      web_patrimonio: {
        include: {
          web_tipo_patrimonio: true,
        },
      },
      projetos: {
        include: {
          PESSOA_PROJETOS_CODGERENTEToPESSOA: {
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
    };
  }

  _formatMovimentacao(movimentacao) {
    const formattedMovimentacao = {
      ...movimentacao,
      responsavel: movimentacao.pessoa,
      projeto: movimentacao.projetos,
      projeto_descricao: movimentacao.projetos.DESCRICAO,
      patrimonio: movimentacao.web_patrimonio,
      patrimonio_tipo: movimentacao.web_patrimonio.web_tipo_patrimonio,
      patrimonio_nserie: movimentacao.web_patrimonio.nserie,
      patrimonio_nome: movimentacao.web_patrimonio.nome,
      patrimonio_descricao: movimentacao.web_patrimonio.descricao,
      patrimonio_nome_tipo:
        movimentacao.web_patrimonio.web_tipo_patrimonio.nome_tipo,
      patrimonio_valor_compra: movimentacao.web_patrimonio.valor_compra,
      responsavel_nome: movimentacao.pessoa.NOME,
      gerente: movimentacao.projetos.PESSOA_PROJETOS_CODGERENTEToPESSOA,
    };
    delete formattedMovimentacao.pessoa;
    delete formattedMovimentacao.projetos;
    delete formattedMovimentacao.web_patrimonio;
    return formattedMovimentacao;
  }
}

module.exports = new MovementationRepository();

