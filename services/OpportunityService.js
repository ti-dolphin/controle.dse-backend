const { prisma } = require("../database");
const OpportunityRepository = require("../repositories/OpportunityRepository");
const ProjectRepository = require("../repositories/ProjectRepository");


class OpportunityService {
  async getById(CODOS) {
    return await OpportunityRepository.getById(CODOS);
  }

  async getMany(params) {
    const { user, searchTerm, filters, finalizados } = params;
    const normalizedFilters = this.normalizeFilters(filters);
    console.log(normalizedFilters);
    return await OpportunityRepository.getMany(
      user,
      searchTerm,
      normalizedFilters,
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
      return await OpportunityRepository.create(data);
    }
    let newProject = {
      CODGERENTE: 9999,
      DESCRICAO: data.DESCRICAO,
      ATIVO: 1,
    };
    newProject = await ProjectRepository.create(newProject);
    const newAdicional = await this.createAdicional(Number(newProject.ID));

    data.ID_PROJETO = newProject.ID;
    data.ID_ADICIONAL = newAdicional.ID;

    return await OpportunityRepository.create(data);
  }

  async createAdicional(ID_PROJETO) {
    const lastAdicional = await prisma.adicionais.findFirst({
      where: {
        ID: ID_PROJETO,
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
    data.VALORFATDOLPHIN =
      data.VALORFATDOLPHIN !== "" ? data.VALORFATDOLPHIN : 0;
    data.VALORFATDIRETO = data.VALORFATDIRETO !== "" ? data.VALORFATDIRETO : 0;
    data.VALOR_COMISSAO = data.VALOR_COMISSAO !== "" ? data.VALOR_COMISSAO : 0;
    // }
    return await OpportunityRepository.update(CODOS, data);
  }

  async delete(CODOS) {
    const opp = await OpportunityRepository.getById(CODOS);
    const { ID_PROJETO } = opp;
    const adicional = await prisma.adicionais.findUnique({
      where: {
        ID: opp.ID_ADICIONAL,
      },
    });
    await OpportunityRepository.delete(CODOS);
    if (adicional) {
      await prisma.adicionais.delete({
        where: {
          ID: adicional.ID,
        },
      });
    }
    if (adicional.NUMERO === 0) {
      await prisma.projetos.delete({
        where: {
          ID: ID_PROJETO,
        },
      });
    }
    return true;
  }

  normalizeFilters(filtersArray) {
    if (filtersArray) {
      const intFields = ["CODOS", "ID_PROJETO",  "VALOR_TOTAL"];
      return filtersArray.map((filter) => {
        // Só há uma chave por objeto
        const [field, value] = Object.entries(filter)[0];
        // Se for campo numérico, converte todos os valores possíveis para número
        if (intFields.includes(field)) {
          // Exemplo: { equals: "88" } => { equals: 88 }
          const newValue = {};
          for (const op in value) {
            if (typeof value[op] === "string" && !isNaN(value[op])) {
              newValue[op] = Number(value[op]);
            } else {
              newValue[op] = value[op];
            }
          }
          return { [field]: newValue };
        }

        // Para campos aninhados, verifica recursivamente
        function deepNormalize(obj) {
          if (typeof obj !== "object" || obj === null) return obj;
          const result = Array.isArray(obj) ? [] : {};
          for (const k in obj) {
            if (
              typeof obj[k] === "string" &&
              !isNaN(obj[k])
            ) {
              result[k] = Number(obj[k]);
            } else if (typeof obj[k] === "object") {
              result[k] = deepNormalize(obj[k]);
            } else {
              result[k] = obj[k];
            }
          }
          return result;
        }

        return { [field]: deepNormalize(value) };
      });
    }
    return [];
  }
}

module.exports = new OpportunityService();
