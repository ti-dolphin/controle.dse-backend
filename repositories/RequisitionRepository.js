const { prisma } = require("../database");

class RequisitionRepository {
  getAllFaturamentosTypes = () => {
    return prisma.web_tipo_faturamento.findMany();
  };

  findMany = (
    kanbanFilters,
    searchTerm,
    extraFilters,
    doneReqFilter,
    cancelledReqFilter
  ) => {
    const searchFilter =
      searchTerm && searchTerm.trim() !== ""
        ? this.buildSearchFilter(searchTerm)
        : {};
    const filters = this.buildFilters(extraFilters);

    const query = {
      where: {
        AND: [
          { ...kanbanFilters },
          searchFilter,
          filters,
          {
            web_status_requisicao: {
              nome: { notIn: ["Concluído", "Cancelado"] },
            },
          },
        ],
      },
      include: {
        ...this.buildInclude(),
      },
      orderBy: {
        ID_REQUISICAO: "desc",
      },
    };

    if (doneReqFilter === "true" && cancelledReqFilter === "false") {
      query.where.AND[3] = {
        web_status_requisicao: {
          nome: { notIn: ["Cancelado"] },
        },
      };
    }

    if (cancelledReqFilter === "true" && doneReqFilter === "false") {
      query.where.AND[3] = {
        web_status_requisicao: {
          nome: { notIn: ["Concluído"] },
        },
      };
    }

    if (doneReqFilter === "true" && cancelledReqFilter === "true") {
      query.where.AND[3] = {
        web_status_requisicao: {
          nome: { notIn: [] },
        },
      };
    }

    return prisma.wEB_REQUISICAO
      .findMany(query)
      .then((results) => results.map((item) => this.formatRequisition(item)));
  };

  findById = (ID_REQUISICAO) => {
    return prisma.wEB_REQUISICAO
      .findUnique({
        where: { ID_REQUISICAO: parseInt(ID_REQUISICAO) },
        include: this.buildInclude(),
      })
      .then((result) => this.formatRequisition(result));
  };

  create = (data) => {
    return prisma.wEB_REQUISICAO
      .create({
        data: data,
        include: this.buildInclude(),
      })
      .then((result) => this.formatRequisition(result));
  };

  cancel = async (ID_REQUISICAO) => {
    const cancelledStatus = await prisma.web_status_requisicao.findFirst({
      where: { nome: "Cancelado" },
    });
    return prisma.wEB_REQUISICAO
      .update({
        where: { ID_REQUISICAO: parseInt(ID_REQUISICAO) },
        include: this.buildInclude(),
        data: { id_status_requisicao: cancelledStatus.id_status_requisicao },
      })
      .then((result) => this.formatRequisition(result));
  };

  activate = async (ID_REQUISICAO) => {
    const alteration = await prisma.web_alteracao_req_status.findFirst({
      where: { id_requisicao: parseInt(ID_REQUISICAO) },
      orderBy: { data_alteracao: "desc" },
    });
    const previousStatusId = alteration.id_status_requisicao;
    return prisma.wEB_REQUISICAO
      .update({
        where: { ID_REQUISICAO: parseInt(ID_REQUISICAO) },
        data: { id_status_requisicao: previousStatusId },
        include: this.buildInclude(),
      })
      .then((result) => this.formatRequisition(result));
  };

  update = (ID_REQUISICAO, data) => {
    return prisma.wEB_REQUISICAO
      .update({
        where: { ID_REQUISICAO: parseInt(ID_REQUISICAO) },
        data: data,
        include: this.buildInclude(),
      })
      .then((result) => this.formatRequisition(result));
  };

  buildInclude = () => {
    return {
      web_tipo_requisicao: true,
      PROJETOS: {
        include: {
          //gerente projeto
          PESSOA_PROJETOS_ID_RESPONSAVELToPESSOA: {
            select: {
              NOME: true,
              CODPESSOA: true,
            },
          },
          //responsável projeto
          PESSOA_PROJETOS_CODGERENTEToPESSOA: {
            select: {
              NOME: true,
              CODPESSOA: true,
            },
          },
        },
      },
      //responsável requisição
      PESSOA_WEB_REQUISICAO_ID_RESPONSAVELToPESSOA: {
        select: {
          NOME: true,
          CODPESSOA: true,
        },
      },
      //PESSOA que fez ultima alteração
      PESSOA_WEB_REQUISICAO_alterado_porToPESSOA: {
        select: {
          NOME: true,
          CODPESSOA: true,
        },
      },
      //PESSOA que criou
      PESSOA_WEB_REQUISICAO_criado_porToPESSOA: {
        select: {
          NOME: true,
          CODPESSOA: true,
        },
      },
      web_status_requisicao: true,
    };
  };

  formatRequisition = (item) => {
    const requisition = {
      ...item,
      tipo_requisicao: item.web_tipo_requisicao,
      projeto: item.PROJETOS,
      gerente: item.PROJETOS?.PESSOA_PROJETOS_CODGERENTEToPESSOA,
      responsavel: item.PESSOA_WEB_REQUISICAO_ID_RESPONSAVELToPESSOA,
      responsavel_projeto:
        item.PROJETOS?.PESSOA_PROJETOS_ID_RESPONSAVELToPESSOA,
      status: item.web_status_requisicao,
      alterado_por: item.PESSOA_wEB_REQUISICAO_alterado_porToPESSOA,
      criado_por: item.PESSOA_wEB_REQUISICAO_criado_porToPESSOA,
    };
    if (requisition.projeto) {
      delete requisition.projeto.PESSOA;
      delete requisition.projeto.PESSOA_PROJETOS_ID_RESPONSAVELToPESSOA;
    }
    delete requisition.web_tipo_requisicao;
    delete requisition.PROJETOS;
    delete requisition.PESSOA_WEB_REQUISICAO_ID_RESPONSAVELToPESSOA;
    delete requisition.web_status_requisicao;
    delete requisition.PESSOA_wEB_REQUISICAO_alterado_porToPESSOA;
    delete requisition.PESSOA_wEB_REQUISICAO_criado_porToPESSOA;
    return requisition;
  };

  buildSearchFilter = (searchTerm) => {
    return {
      OR: [
        { DESCRIPTION: { contains: searchTerm } },
        { OBSERVACAO: { contains: searchTerm } },
        {
          PESSOA_WEB_REQUISICAO_ID_RESPONSAVELToPESSOA: {
            NOME: { contains: searchTerm },
          },
        },
        {
          PESSOA_WEB_REQUISICAO_alterado_porToPESSOA: {
            NOME: { contains: searchTerm },
          },
        },
        {
          PESSOA_WEB_REQUISICAO_criado_porToPESSOA: {
            NOME: { contains: searchTerm },
          },
        },
        { PROJETOS: { DESCRICAO: { contains: searchTerm } } },
        {
          PROJETOS: {
            PESSOA_PROJETOS_CODGERENTEToPESSOA: {
              NOME: { contains: searchTerm },
            },
          },
        },
        { web_status_requisicao: { nome: { contains: searchTerm } } },
        { web_tipo_requisicao: { nome_tipo: { contains: searchTerm } } },
      ],
    };
  };

  buildFilters = (filters) => {
    if (!filters) return {};

    const filterMap = {
      ID_REQUISICAO: (value) => {
        return value !== ""
          ? {
              ID_REQUISICAO: {
                equals: Number(value),
              },
            }
          : {};
      },
      DESCRIPTION: (value) => ({ DESCRIPTION: { contains: value } }),
      responsavel: (value) => ({
        PESSOA_WEB_REQUISICAO_ID_RESPONSAVELToPESSOA: {
          NOME: { contains: value },
        },
      }),
      projeto: (value) => ({ PROJETOS: { DESCRICAO: { contains: value } } }),
      gerente: (value) => ({
        PROJETOS: {
          PESSOA_PROJETOS_CODGERENTEToPESSOA: { NOME: { contains: value } },
        },
      }),
      status: (value) => ({
        web_status_requisicao: { nome: { contains: value } },
      }),
      tipo: (value) => ({
        web_tipo_requisicao: { nome_tipo: { contains: value } },
      }),
      custo_total: (value) => {
        return value !== ""
          ? {
              custo_total: {
                gte: value,
              },
            }
          : {};
      },
      responsavel_projeto: (value) => ({
        PROJETOS: {
          PESSOA_PROJETOS_ID_RESPONSAVELToPESSOA: { NOME: { contains: value } },
        },
      }),
    };

    const prismaFilters = Object.entries(filters).map(([key, value]) => {
      if (filterMap[key]) {
        return filterMap[key](value);
      }
      return {};
    });

    return { AND: prismaFilters };
  };

  delete = (ID_REQUISICAO) => {
    return prisma.wEB_REQUISICAO.delete({
      where: {
        ID_REQUISICAO: parseInt(ID_REQUISICAO),
      },
    });
  };
}

module.exports = new RequisitionRepository();
