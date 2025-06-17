const { prisma } = require("../database");

class RequisitionRepository {
  async findMany(params) {
    const requisicoes = await prisma.web_requisicao
      .findMany({
        where: params,
        include: {
          web_tipo_requisicao: true,
          projetos: {
            include: {
              pessoa: {
                select: {
                  NOME: true,
                  CODPESSOA: true,
                },
              },
            },
          },
          pessoa_web_requisicao_ID_RESPONSAVELTopessoa: {
            select: {
              NOME: true,
              CODPESSOA: true,
            },
          },
        },
      })
      .then((results) =>
        results.map((result) => { 
            const newResult = {
              ...result,
              tipo_requisicao: result.web_tipo_requisicao,
              projeto: result.projetos,
              gerente: result.projetos.pessoa,
              responsavel: result.pessoa_web_requisicao_ID_RESPONSAVELTopessoa,
            };
            delete newResult.web_tipo_requisicao;
            delete newResult.projetos;
            delete newResult.pessoa_web_requisicao_ID_RESPONSAVELTopessoa;
            return newResult;
        })
      );
      return requisicoes;
  }

  async findById(id) {
    const requisicao = await prisma.web_requisicao
      .findUnique({
        where: {
          ID_REQUISICAO: parseInt(id),
        },
        include: {
          web_tipo_requisicao: true,
          projetos: {
            include: {
              pessoa: {
                select: {
                  NOME: true,
                  CODPESSOA: true,
                },
              },
            },
          },
          pessoa_web_requisicao_ID_RESPONSAVELTopessoa: {
            select: {
              NOME: true,
              CODPESSOA: true,
            },
          },
        },
      })
      .then((result) => ({
        ...result,
        tipo_requisicao: result.web_tipo_requisicao,
        projeto: result.projetos,
        gerente: result.projetos.pessoa,
        responsavel: result.pessoa_web_requisicao_ID_RESPONSAVELTopessoa,
      }));

    delete requisicao.web_tipo_requisicao;
    delete requisicao.projetos;
    delete requisicao.pessoa_web_requisicao_ID_RESPONSAVELTopessoa;

    return requisicao;
  }

  async create(data) {
    return await prisma.web_requisicao.create({
      data: data,
    });
  }

  async update(id, data) {
    return await prisma.web_requisicao.update({
      where: {
        ID_REQUISICAO: parseInt(id),
      },
      data: data,
    });
  }

  async delete(id) {
    return await prisma.web_requisicao.delete({
      where: {
        ID_REQUISICAO: parseInt(id),
      },
    });
  }
}
module.exports = new RequisitionRepository();
