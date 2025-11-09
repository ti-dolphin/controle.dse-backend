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

      if (tipoFaturamento === 3) {
        tipoFaturamentoFilter = {
          codigo: {
            in: ['07.002.01.0028', '07.002.01.0009']
          }
        };
      } else if (tipoFaturamento === 6) {
        tipoFaturamentoFilter = {
          codigo: {
            in: [
              "11.001.04.5001",
              "11.001.04.5025",
              "11.001.04.5003",
              "11.001.04.5005",
              "11.001.05.5013",
              "11.001.05.5016",
              "11.001.05.5032",
              "11.001.04.5004",
              "11.001.01.5032",
              "11.001.01.5077",
              "11.001.01.5078",
              "11.001.04.5002",
              "11.001.05.5001",
              "11.001.05.5002",
              "11.001.05.5006",
              "11.001.05.5007",
              "11.001.05.5008",
              "11.001.05.5021",
              "11.001.12.5015",
              "11.001.05.5031",
              "11.001.12.5019",
              "11.001.03.5022",
              "11.001.12.5003",
              "11.001.10.5002",
              "11.001.01.5093",
              "11.001.05.5032",
              "07.002.01.0019",
              "07.002.01.0021"
            ],
          },
        };
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