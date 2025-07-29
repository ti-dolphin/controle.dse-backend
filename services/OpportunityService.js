const { prisma } = require("../database");
const OpportunityRepository = require("../repositories/OpportunityRepository");
const ProjectRepository = require("../repositories/ProjectRepository");


class OpportunityService {
  async getById(CODOS) {
    return await OpportunityRepository.getById(CODOS);
  }

  async getMany(params) {
    const { user, searchTerm, filters, finalizados } = params;
    console.log("user in Service: ", user);
    return await OpportunityRepository.getMany(
      user,
      searchTerm,
      filters,
      finalizados
    );
  }

  async getStatuses() {
    return await OpportunityRepository.getStatuses();
  }

  async create(data, isAdicional) {
    if (isAdicional) {
      const newAdicional = await this.createAdicional(Number(data.ID_PROJETO));
      data.ID_ADICIONAL = newAdicional.ID;
      console.log("novo adicional: ", newAdicional);
      console.log("data: ", data);
       return await OpportunityRepository.create(data);
    }
    let newProject = {
      CODGERENTE: 9999,
      DESCRICAO : data.DESCRICAO,
      ATIVO : 1
    };
    newProject = await ProjectRepository.create(newProject);
    console.log("novo projeto criado: ", newProject);
    const newAdicional = await this.createAdicional(Number(newProject.ID));
   
    console.log("novo adicional zero criado: ", newAdicional);
    data.ID_PROJETO = newProject.ID;
    data.ID_ADICIONAL = newAdicional.ID;

    return await OpportunityRepository.create(data);
  }

  async createAdicional(ID_PROJETO) {
    const lastAdicional = await prisma.adicionais.findFirst({
      where: {
        ID_PROJETO,
      },
      orderBy: {
        ID: "desc",
      },
    });
    if (lastAdicional) {
          const { NUMERO } = lastAdicional;
          const newAdicional = await prisma.adicionais.create({
            data: {
              ID_PROJETO,
              NUMERO: NUMERO + 1,
            },
          });
          return newAdicional;
    }
    const newAdicional = await prisma.adicionais.create({
      data: {
        ID_PROJETO,
        NUMERO: 0,
      },
    });
    return newAdicional;
   
  }

  async update(CODOS, data) {
    // if (data.VALORFATDOLPHIN && data.VALORFATDIRETO && data.VALOR_COMISSAO){
      data.VALORFATDOLPHIN = data.VALORFATDOLPHIN !== '' ? data.VALORFATDOLPHIN : 0;
      data.VALORFATDIRETO = data.VALORFATDIRETO !== '' ? data.VALORFATDIRETO : 0;
      data.VALOR_COMISSAO = data.VALOR_COMISSAO !== '' ? data.VALOR_COMISSAO : 0;
    // }
      return await OpportunityRepository.update(CODOS, data);
  }

  async delete(CODOS) {
    return await OpportunityRepository.delete(CODOS);
  }
}

module.exports = new OpportunityService();
