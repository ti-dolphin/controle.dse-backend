const { prisma } = require("../database");

class OpportunityRepository {
    static async getById(CODOS) {
        
        return await prisma.ordemservico.findUnique({
            where: { CODOS },
            include: { 
                projetos: true,
                cliente: { 
                    select:{ 
                        CNPJ: true, 
                        NOMEFANTASIA: true, 
                        CODCLIENTE: true, 
                        CODCOLIGADA: true
                    }
                }
            }
        }).then(opportunity => { 
            const formattedOpp = {
              ...opportunity,
              projeto: opportunity.projetos,
            };
            delete formattedOpp.projetos;
            return formattedOpp;
        });
    }

    static async getMany(params) {        
        return await prisma.ordemservico.findMany({ 
            where: params,
            include: { 
                projetos: true,
                cliente: true
            }
        }).then(opps => (opps.map(opportunity => {
            const formattedOpp = {
              ...opportunity,
              projeto: opportunity.projetos,
            };
            delete formattedOpp.projetos;
            return formattedOpp;
        })));
    }

    static async create(payload) {
        return await prisma.ordemservico.create({
            data: payload
        });
    }

    static async update(CODOS, payload) {
        return await prisma.ordemservico.update({
            where: { CODOS },
            data: payload
        });
    }

    static async delete(CODOS) {
        return await prisma.ordemservico.delete({
            where: { CODOS }
        });
    }

}

module.exports = OpportunityRepository;
