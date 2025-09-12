const { prisma } = require("../database");
const MovementationRepository = require("../repositories/MovementationRepository");
const MovementationTrigger = require("../triggers/MovementationTrigger");


class MovementationService {
  async create(payload) {
    return await prisma.$transaction(async (tx) => {
      const mov = await MovementationRepository.create(payload, tx);
      const checklist = await MovementationTrigger.afterCreate(mov, tx);
      return { mov, checklist };
    });
  }

  async getMany(params) {
    const {search, prismaFilters, from, id_patrimonio} = params;
    const filters = this.normalizeFilters(prismaFilters);
    const movementations = await MovementationRepository.getMany(
      search,
      filters, 
      id_patrimonio,
      from
    );
    return movementations
  }

  async getById(id_movimentacao) {
    return await MovementationRepository.getById(id_movimentacao);
  }

  async update(id_movimentacao, payload) {
    return await MovementationRepository.update(id_movimentacao, payload);
  }

  async delete(id_movimentacao) {
    return await MovementationRepository.delete(id_movimentacao);
  }

  normalizeFilters(filtersArray) {
    if (filtersArray) {
      const intFields = ["CODOS", "ID_PROJETO", "VALOR_TOTAL"];
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
            if (typeof obj[k] === "string" && !isNaN(obj[k])) {
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
module.exports = new MovementationService();
