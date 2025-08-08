// controle.dse-backend/repositories/webComentariosRequsicaoRepository.js
const { prisma } = require("../database");

class RequisitionCommentRepository {
  async create(data) {
    return prisma.web_comentarios_requsicao.create({ data });
  }

  async getMany(params) {
    return prisma.web_comentarios_requsicao.findMany(params);
  }

  async getById(id) {
    return prisma.web_comentarios_requsicao.findUnique({ where: { id } });
  }

  async update(id, data) {
    return prisma.web_comentarios_requsicao.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.web_comentarios_requsicao.delete({ where: { id } });
  }
}

module.exports = new  RequisitionCommentRepository();
