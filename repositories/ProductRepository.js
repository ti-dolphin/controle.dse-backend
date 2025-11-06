const {prisma} = require('../database');

class ProductRepository {
  async getMany(params, searchTerm) {
    let newParams = { ...params };
    let tipoFaturamento = null;
    
    if (newParams.tipoFaturamento) {
      tipoFaturamento = Number(newParams.tipoFaturamento);
      delete newParams.tipoFaturamento;
    }
    
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

    // Se tipo_faturamento === 3, filtra apenas produtos específicos
    const tipoFaturamentoFilter = tipoFaturamento === 3
      ? {
          codigo: {
            in: ['07.002.01.0028', '07.002.01.0009']
          }
        }
      : {};

    return await prisma.produtos.findMany({
      where: { 
        ...newParams, 
        ...generalFilter,
        ...tipoFaturamentoFilter
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