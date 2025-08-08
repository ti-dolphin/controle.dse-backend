const { prisma } = require("../database");

class RequisitionRepository {
  async findMany(kanbanFilters, searchTerm, extraFilters) {
    const searchFilter = searchTerm && searchTerm.trim() !== "" ? this.buildSearchFilter(searchTerm) : {};
    const filters = this.buildFilters(extraFilters);

    const requisitions = await prisma.web_requisicao
      .findMany({
        where: {
          AND: [{ ...kanbanFilters }, searchFilter, filters],
        },
        include: this.buildInclude(),
        orderBy: {
          ID_REQUISICAO: "desc",
        },
      })
      .then((results) => results.map((item) => this.formatRequisition(item)));
    return requisitions;
  }

  async findById(ID_REQUISICAO) {
    const requisicao = await prisma.web_requisicao
      .findUnique({
        where: { ID_REQUISICAO: parseInt(ID_REQUISICAO) },
        include: this.buildInclude(),
      })
      .then((result) => this.formatRequisition(result));

    return requisicao;
  }

  async create(data) {
    const requisicao = await prisma.web_requisicao
      .create({
        data: data,
        include: this.buildInclude(),
      })
      .then((result) => this.formatRequisition(result));

    return requisicao;
  }

  async cancel(ID_REQUISICAO) {
    const cancelledStatus = await prisma.web_status_requisicao.findFirst({
      where: { nome: "Cancelado" },
    });
    const updatedReq = await prisma.web_requisicao
      .update({
        where: { ID_REQUISICAO: parseInt(ID_REQUISICAO) },
        include: this.buildInclude(),
        data: { id_status_requisicao: cancelledStatus.id_status_requisicao },
      })
      .then((result) => this.formatRequisition(result));

    return updatedReq;
  }

  async activate(ID_REQUISICAO) {
    const alteration = await prisma.web_alteracao_req_status.findFirst({
      where: { id_requisicao: parseInt(ID_REQUISICAO) },
      orderBy: { data_alteracao: "desc" },
    });
    const previousStatusId = alteration.id_status_requisicao;
    const updatedReq = await prisma.web_requisicao
      .update({
        where: { ID_REQUISICAO: parseInt(ID_REQUISICAO) },
        data: { id_status_requisicao: previousStatusId },
        include: this.buildInclude(),
      })
      .then((result) => this.formatRequisition(result));

    return updatedReq;
  }

  async update(ID_REQUISICAO, data) {
    return await prisma.web_requisicao
      .update({
        where: { ID_REQUISICAO: parseInt(ID_REQUISICAO) },
        data: data,
        include: this.buildInclude(),
      })
      .then((result) => this.formatRequisition(result));
  }

  buildInclude() {
   
    return {
      web_tipo_requisicao: true,
      projetos: {
        include: {
          //gerente projeto
          pessoa: {
            select: {
              NOME: true,
              CODPESSOA: true,
            },
          },
          //responsável projeto
           pessoa_projetos_ID_RESPONSAVELTopessoa:{ 
            select: {
              NOME: true,
              CODPESSOA: true,
            }
           }
        },
      },
      //responsável requisição
      pessoa_web_requisicao_ID_RESPONSAVELTopessoa: {
        select: {
          NOME: true,
          CODPESSOA: true,
        },
      },
      //pessoa que fez ultima alteração
      pessoa_web_requisicao_alterado_porTopessoa: {
        select: {
          NOME: true,
          CODPESSOA: true,
        },
      },
      //pessoa que criou
      pessoa_web_requisicao_criado_porTopessoa: {
        select: {
          NOME: true,
          CODPESSOA: true,
        },
      },
      web_status_requisicao: true,
    };
  }

  formatRequisition(item) {
    const requisition = {
      ...item,
      tipo_requisicao: item.web_tipo_requisicao,
      projeto: item.projetos,
      gerente: item.projetos?.pessoa,
      responsavel: item.pessoa_web_requisicao_ID_RESPONSAVELTopessoa,
      responsavel_projeto: item.projetos?.pessoa_projetos_ID_RESPONSAVELTopessoa,
      status: item.web_status_requisicao,
      alterado_por: item.pessoa_web_requisicao_alterado_porTopessoa,
      criado_por: item.pessoa_web_requisicao_criado_porTopessoa,
    };
    delete requisition.web_tipo_requisicao;
    if (requisition.projeto){ 
      delete requisition.projeto.pessoa;
      delete requisition.projeto.pessoa_projetos_ID_RESPONSAVELTopessoa;
    }
    delete requisition.projetos;
    delete requisition.pessoa_web_requisicao_ID_RESPONSAVELTopessoa;
    delete requisition.web_status_requisicao;
    delete requisition.pessoa_web_requisicao_alterado_porTopessoa;
    delete requisition.pessoa_web_requisicao_criado_porTopessoa;
    return requisition;
  }

  buildSearchFilter(searchTerm) {
    return {
      OR: [
        { DESCRIPTION: { contains: searchTerm } },
        { OBSERVACAO: { contains: searchTerm } },
        {
          pessoa_web_requisicao_ID_RESPONSAVELTopessoa: {
            NOME: { contains: searchTerm },
          },
        },
        {
          pessoa_web_requisicao_alterado_porTopessoa: {
            NOME: { contains: searchTerm },
          },
        },
        {
          pessoa_web_requisicao_criado_porTopessoa: {
            NOME: { contains: searchTerm },
          },
        },
        { projetos: { DESCRICAO: { contains: searchTerm } } },
        { projetos: { pessoa: { NOME: { contains: searchTerm } } } },
        { web_status_requisicao: { nome: { contains: searchTerm } } },
        { web_tipo_requisicao: { nome_tipo: { contains: searchTerm } } },
        { pessoa_projetos_ID_RESPONSAVELTopessoa: { NOME: { contains: searchTerm } } },
      ],
    };
  }

  buildFilters(filters) {
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
        pessoa_web_requisicao_ID_RESPONSAVELTopessoa: {
          NOME: { contains: value },
        },
      }),
      projeto: (value) => ({ projetos: { DESCRICAO: { contains: value } } }),
      gerente: (value) => ({
        projetos: { pessoa: { NOME: { contains: value } } },
      }),
      status: (value) => ({ web_status_requisicao: { nome: { contains: value } } }),
      tipo: (value) => ({ web_tipo_requisicao: { nome_tipo: { contains: value } } }),
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
       projetos : { pessoa_projetos_ID_RESPONSAVELTopessoa: { NOME: { contains: value } } },
      }),
    };

    const prismaFilters = Object.entries(filters).map(([key, value]) => {
      if (filterMap[key]) {
        return filterMap[key](value);
      }
      return {};
    });

    return { AND: prismaFilters };
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

