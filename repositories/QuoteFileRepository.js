//QuoteFileRepository
const {prisma} = require('../database');
const {buildWhere} = require('../utils');

class QuoteFileRepository {
  async create(payload) {
    return await prisma.web_anexo_cotacao.create({ data: payload, include: {
      web_cotacao: true,
    }}).then((anexo) => {
      const formattedAnexo = {
        ...anexo,
        cotacao: anexo.web_cotacao,
      };
        delete formattedAnexo.web_cotacao;
      return formattedAnexo;
    });
  }

  async getMany(params) {
    const where = buildWhere(params, ['id_cotacao']);
    return await prisma.web_anexo_cotacao.findMany({
      where,
      include: {
        web_cotacao: true,
      },
    }).then((anexos) => (anexos.map((anexo) => {
        const formattedAnexo = {
          ...anexo,
          cotacao: anexo.web_cotacao,
        };
        delete formattedAnexo.web_cotacao;
        return formattedAnexo;
      })));
  }

  async getById(id_anexo_cotacao) {
    return await prisma.web_anexo_cotacao
      .findUnique({
        where: { id_anexo_cotacao },
        include: {
          web_cotacao: true,
        },
      })
      .then((anexo) => {
        const formattedAnexo = {
          ...anexo,
          cotacao: anexo.web_cotacao,
        };
        delete formattedAnexo.web_cotacao;
        return formattedAnexo;
      });
  }

  async update(id_anexo_cotacao, payload) {
    return await prisma.web_anexo_cotacao
      .update({
        where: { id_anexo_cotacao },
        data: payload,
        include: {
          web_cotacao: true,
        },
      })
      .then((anexo) => {
        const formattedAnexo = {
          ...anexo,
          cotacao: anexo.web_cotacao,
        };
        delete formattedAnexo.web_cotacao;
        return formattedAnexo;
      });;
  }

  async delete(id_anexo_cotacao) {
    return await prisma.web_anexo_cotacao.delete({
      where: { id_anexo_cotacao },
    });
  }
}

module.exports = new QuoteFileRepository();