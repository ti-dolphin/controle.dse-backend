const { prisma } = require("../database");


class ProductAttachmentService {
  static async getByProduct() {
    return await prisma.web_anexos_produto.findMany();
  }

  static async getById(id) {
    return await prisma.web_anexos_produto.findUnique({
      where: { id_anexo_produto: parseInt(id) },
    });
  }

  static async create(data) {
    return await prisma.web_anexos_produto.create({ data });
  }

  static async update(id, data) {
    return await prisma.web_anexos_produto.update({
      where: { id_anexo_produto: parseInt(id) },
      data,
    });
  }

  static async delete(id) {
    return await prisma.web_anexos_produto.delete({
      where: { id_anexo_produto: parseInt(id) },
    });
  }
}

module.exports = ProductAttachmentService;
