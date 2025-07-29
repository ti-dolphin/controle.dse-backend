const { prisma } = require("../database");

class OpportunityAttachmentRepository {
  static async getMany(CODOS) {
    return await prisma.web_anexos_os.findMany({
      where: { codos: CODOS },
    });
  }
  static async getById(id_anexo_os) {
    return await prisma.web_anexos_os.findUnique({
      where: { id_anexo_os },
    });
  }

  static async create(data) {
    return await prisma.web_anexos_os.create({
      data: data,
    });
  }

  static async update(id_anexo_os, data) {
    return await prisma.web_anexos_os.update({
      where: { id_anexo_os },
      data: data,
    });
  }

  static async delete(id_anexo_os) {
    return await prisma.web_anexos_os.delete({
      where: { id_anexo_os },
    });
  }
}

module.exports = OpportunityAttachmentRepository;

