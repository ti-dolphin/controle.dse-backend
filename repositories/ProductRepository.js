const {prisma} = require('../database');

class ProductRepository {
  async getMany(params) {
    return await prisma.produtos.findMany({
      where: params,
    });
  }

  async getById(ID) {
    return await prisma.produtos.findUnique({
      where: { ID },
    });
  }

  async create(data) {
    return await prisma.produtos.create({
      data,
    });
  }

  async update(id, data) {
    return await prisma.produtos.update({
      where: { ID: id },
      data,
    });
  }

  async delete(id) {
    return await prisma.produtos.delete({
      where: { ID: id },
    });
  }
}

module.exports = new ProductRepository();