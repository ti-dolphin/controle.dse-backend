const { prisma } = require("../database");

class RequisitionRepository {
  async findMany(kanbanFilters, searchTerm, extraFilters) {
    const searchFilter = searchTerm && searchTerm.trim() !== ''
      ? {
          OR: [
            { DESCRIPTION: { contains: searchTerm } },
            { OBSERVACAO: { contains: searchTerm } },
            { pessoa_web_requisicao_ID_RESPONSAVELTopessoa: { NOME: { contains: searchTerm } } },
            { pessoa_web_requisicao_alterado_porTopessoa: { NOME: { contains: searchTerm } } },
            { pessoa_web_requisicao_criado_porTopessoa: { NOME: { contains: searchTerm } } },
            { projetos: { DESCRICAO: { contains: searchTerm } } },
            { projetos: { pessoa: { NOME: { contains: searchTerm } } } },
            { web_status_requisicao: { nome: { contains: searchTerm } } },
            { web_tipo_requisicao: { nome_tipo: { contains: searchTerm } } },
          ],
        }
      : {};

    const filterConditions = extraFilters && extraFilters.length > 0
      ? { AND: [...extraFilters] }
      : {};

    const requisitions = await prisma.web_requisicao
      .findMany({
        where: {
          AND: [
            { ...kanbanFilters },
            searchFilter,
            filterConditions,
          ],
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
          pessoa_web_requisicao_alterado_porTopessoa: {
            select: {
              NOME: true,
              CODPESSOA: true,
            },
          },
          pessoa_web_requisicao_criado_porTopessoa: {
            select: {
              NOME: true,
              CODPESSOA: true,
            },
          },
          web_status_requisicao: true,
        },
      })
      .then((results) =>
        results.map((item) => {
          if (!item.projetos) {
            console.log("Requisição sem projeto:", item.ID_REQUISICAO);
          }
          const requisition = {
            ...item,
            tipo_requisicao: item.web_tipo_requisicao,
            projeto: item.projetos,
            gerente: item.projetos?.pessoa,
            responsavel: item.pessoa_web_requisicao_ID_RESPONSAVELTopessoa,
            status: item.web_status_requisicao,
            alterado_por: item.pessoa_web_requisicao_alterado_porTopessoa,
            criado_por: item.pessoa_web_requisicao_criado_porTopessoa,
          };
          delete requisition.web_tipo_requisicao;
          if (requisition.projeto) delete requisition.projeto.pessoa;
          delete requisition.projetos;
          delete requisition.pessoa_web_requisicao_ID_RESPONSAVELTopessoa;
          delete requisition.web_status_requisicao;
          delete requisition.pessoa_web_requisicao_alterado_porTopessoa;
          delete requisition.pessoa_web_requisicao_criado_porTopessoa;
          return requisition;
        })
      );
    return requisitions;
  }

  async findById(ID_REQUISICAO) {
    const requisicao = await prisma.web_requisicao
      .findUnique({
        where: {
          ID_REQUISICAO: parseInt(ID_REQUISICAO),
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
          web_status_requisicao: true,
        },
      })
      .then((result) => ({
        ...result,
        tipo_requisicao: result.web_tipo_requisicao,
        projeto: result.projetos,
        gerente: result.projetos.pessoa,
        status: result.web_status_requisicao,
        responsavel: result.pessoa_web_requisicao_ID_RESPONSAVELTopessoa,
      }));

    delete requisicao.web_tipo_requisicao;
    delete requisicao.projetos;
    delete requisicao.projeto.pessoa;
    delete requisicao.pessoa_web_requisicao_ID_RESPONSAVELTopessoa;
    delete requisicao.web_status_requisicao;

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
          pessoa_web_requisicao_alterado_porTopessoa: {
            select: {
              NOME: true,
              CODPESSOA: true,
            },
          },
          pessoa_web_requisicao_criado_porTopessoa: {
            select: {
              NOME: true,
              CODPESSOA: true,
            },
          },
          web_status_requisicao: true,
        },
      })
      .then((result) => ({
        ...result,
        tipo_requisicao: result.web_tipo_requisicao,
        projeto: result.projetos,
        gerente: result.projetos.pessoa,
        responsavel: result.pessoa_web_requisicao_ID_RESPONSAVELTopessoa,
        status: result.web_status_requisicao,
        alterado_por: result.pessoa_web_requisicao_alterado_porTopessoa,
        criado_por: result.pessoa_web_requisicao_criado_porTopessoa,

      }));

    console.log("Requisição criada:", requisicao);
    delete requisicao.web_tipo_requisicao;
    delete requisicao.projetos;
    delete requisicao.projeto.pessoa;
    delete requisicao.pessoa_web_requisicao_ID_RESPONSAVELTopessoa;
    delete requisicao.web_status_requisicao;
    delete requisicao.pessoa_web_requisicao_alterado_porTopessoa;
    delete requisicao.pessoa_web_requisicao_criado_porTopessoa;

    return requisicao;
  }

  async update(ID_REQUISICAO, data) {
    return await prisma.web_requisicao
      .update({
        where: {
          ID_REQUISICAO: parseInt(ID_REQUISICAO),
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
          web_status_requisicao: true
        },
      })
      .then((result) => ({
        ...result,
        tipo_requisicao: result.web_tipo_requisicao,
        projeto: result.projetos,
        gerente: result.projetos.pessoa,
        status: result.web_status_requisicao,
        responsavel: result.pessoa_web_requisicao_ID_RESPONSAVELTopessoa,
      }));
  }

  async delete(ID_REQUISICAO) {
    return await prisma.web_requisicao.delete({
      where: {
        ID_REQUISICAO: parseInt(ID_REQUISICAO),
      },
    });
  }
}
module.exports = new RequisitionRepository();
