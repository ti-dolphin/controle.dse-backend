const { prisma } = require("../database");

class OpportunityCommentRepository {
  async findMany(CODOS) {
    return await prisma.cOMENTARIOS.findMany({ where: { CODOS } });
  }

  async findUnique(CODCOMENTARIO) {
    return await prisma.cOMENTARIOS.findUnique({
      where: { CODCOMENTARIO },
    });
  }

  async create(data) {
    data.CODAPONT = 0;
    return await prisma.cOMENTARIOS.create({ data });
  }

  async update(CODCOMENTARIO, data) {
    return await prisma.cOMENTARIOS.update({
      where: { CODCOMENTARIO },
      data,
    });
  }

  async delete(CODCOMENTARIO) {
    return await prisma.cOMENTARIOS.delete({
      where: { CODCOMENTARIO },
    });
  }
}

module.exports = new OpportunityCommentRepository();

