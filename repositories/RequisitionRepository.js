const { prisma } = require("../database");
const {buildWhere} = require("../utils");

class RequisitionRepository {
  async findMany(params) {
    const where = buildWhere(params, ['id_requisicao','id_status_requisicao', 'TIPO', 'ID_PROJETO', 'TIPO', 'ID_RESPONSAVEL'])


    const requisicoes = await prisma.web_requisicao
      .findMany({
        where,
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
          pessoa_web_requisicao_alterado_porTopessoa : { 
            select: {
              NOME: true,
              CODPESSOA: true,
            },
          },
          pessoa_web_requisicao_criado_porTopessoa : { 
            select: {
              NOME: true,
              CODPESSOA: true,
            },
          },
          web_status_requisicao: true
        }
      })
      .then((results) =>
        results.map((result) => {
          if (result.projetos === null) {
            console.log("Requisição sem projeto:", result.ID_REQUISICAO);
          }
          const newResult = {
            ...result,
            tipo_requisicao: result.web_tipo_requisicao,
            projeto: result.projetos,
            gerente: result.projetos.pessoa,
            responsavel: result.pessoa_web_requisicao_ID_RESPONSAVELTopessoa,
            status: result.web_status_requisicao,
            pessoa_alterado_por : result.pessoa_web_requisicao_alterado_porTopessoa,
            pessoa_criado_por : result.pessoa_web_requisicao_criado_porTopessoa
          };
          delete newResult.web_tipo_requisicao;
          delete newResult.projeto.pessoa;
          delete newResult.projetos;
          delete newResult.pessoa_web_requisicao_ID_RESPONSAVELTopessoa;
          delete newResult.web_status_requisicao;
          delete newResult.pessoa_web_requisicao_alterado_porTopessoa;
          delete newResult.pessoa_web_requisicao_criado_porTopessoa;
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
    delete requisicao.projeto.pessoa;
    delete requisicao.pessoa_web_requisicao_ID_RESPONSAVELTopessoa;

    return requisicao;
  }

  async create(data) {
    const requisicao = await prisma.web_requisicao
      .create({
        data: data,
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
    // Remover os campos originais para manter o formato desejado
    delete requisicao.web_tipo_requisicao;
    delete requisicao.projetos;
    delete requisicao.projeto.pessoa;
    delete requisicao.pessoa_web_requisicao_ID_RESPONSAVELTopessoa;

    return requisicao;
  }

  async update(id, data) {
    return await prisma.web_requisicao
      .update({
        where: {
          ID_REQUISICAO: parseInt(id),
        },
        data: data,
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
