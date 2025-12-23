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

    let tipoFaturamentoFilter = {};

    console.log("tipo de faturamento", tipoFaturamento, typeof tipoFaturamento);

    switch (tipoFaturamento) {
      case 1:
        tipoFaturamentoFilter = {
          perm_faturamento_dse: 1,
        };
        break;
      case 2:
        tipoFaturamentoFilter = {
          perm_faturamento_direto: 1,
        };
        break;
      case 3:
        tipoFaturamentoFilter = {
          perm_operacional: 1,
        };
        break;
      case 6:
        tipoFaturamentoFilter = {
          perm_ti: 1
        };
        break;
      default:
        tipoFaturamentoFilter = {};
    }
    
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