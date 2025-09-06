const {prisma} = require('../database');

class ProductRepository {
  async getMany(params, searchTerm) {
    const generalFilter =
      searchTerm && searchTerm.trim() !== ""
        ? {
            OR: [
              { descricao: { contains: searchTerm } },
              { codigo: { contains: searchTerm } },
              { unidade: { contains: searchTerm } },
            ],
          }
        : {};


    return await prisma.produtos.findMany({
      where: { 
        ...params, 
        ...generalFilter
      },
      include: { 
        web_anexos_produto: true
      }
    }).then((produtos) => (produtos.map((produto) => ({
      ...produto,
      anexos: produto.web_anexos_produto || []
    }))));
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