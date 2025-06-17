const { prisma } = require("../database");

class OpportunityRepository {
    static async getById(CODOS) {
        
        return await prisma.ordemservico.findUnique({
            where: { CODOS }
        });
    }

    static async getMany(query) {        
        console.log('query: ', query)
        return await prisma.ordemservico.findMany({ 
            where: query
        });
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
