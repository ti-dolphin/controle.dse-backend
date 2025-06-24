const { prisma } = require("../database");

class PatrimonyRepository {
  async create(payload) {
    return await prisma.web_patrimonio
      .create({
        data: payload,
        include: {
          web_tipo_patrimonio: true,
        },
      })
      .then((result) => {
        const newResult = {
          ...result,
          tipo: result.web_tipo_patrimonio,
        };
        delete newResult.web_tipo_patrimonio;
        return newResult;
      });
  }

  async getMany(params) {
    return await prisma.web_patrimonio
      .findMany({
        where: params,
        include: {
          web_tipo_patrimonio: true,
        },
      })
      .then((results) =>
        results.map((result) => {
          const newResult = {
            ...result,
            tipo: result.web_tipo_patrimonio,
          };
          delete newResult.web_tipo_patrimonio;
          return newResult;
        })
      );
  }

  async getById(id_patrimonio) {
    return await prisma.web_patrimonio
      .findUnique({
        where: { id_patrimonio: parseInt(id_patrimonio) },
        include: {
          web_tipo_patrimonio: true,
        },
      })
      .then((result) => {
        const newResult = {
          ...result,
          tipo: result.web_tipo_patrimonio,
        };
        delete newResult.web_tipo_patrimonio;
        return newResult;
      });
  }

  async update(id_patrimonio, payload) {
    return await prisma.web_patrimonio
      .update({
        where: { id_patrimonio: parseInt(id_patrimonio) },
        data: payload,
        include: {
          web_tipo_patrimonio: true,
        },
      })
      .then((result) => {
        const newResult = {
          ...result,
          tipo: result.web_tipo_patrimonio,
        };
        delete newResult.web_tipo_patrimonio;
        return newResult;
      });
  }

  async delete(id_patrimonio) {
    return await prisma.web_patrimonio.delete({
      where: { id_patrimonio: parseInt(id_patrimonio) },
    });
  }
}
module.exports = new PatrimonyRepository();
