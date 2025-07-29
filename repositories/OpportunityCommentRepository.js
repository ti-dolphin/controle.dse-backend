const { prisma } = require("../database");

class OpportunityCommentRepository {
  async findMany(CODOS) {
    return await prisma.comentarios.findMany({ where: { CODOS } });
  }

  async findUnique(CODCOMENTARio ){
    return await prisma.comentarios.findUnique({ 
        where: { CODCOMENTARIO }
    });
  }

  async create(data) {
    return await prisma.comentarios.create({ data });
  }

  async update(CODCOMENTARIO, data) {
    return await prisma.comentarios.update({ 
        where : {CODCOMENTARIO},
        data
    });
  }

  async delete(CODCOMENTARIO) {
    return await prisma.comentarios.delete({
      where: { CODCOMENTARIO },
    });
  }
}

module.exports = new OpportunityCommentRepository();

