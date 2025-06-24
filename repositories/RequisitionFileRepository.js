const { prisma } = require('../database');
const { buildWhere } = require('../utils');

class RequisitionFileRepository {
    async getMany(params) {
        const where = buildWhere(params, ['id_requisicao']);
        return await prisma.web_anexos_requisicao.findMany({ where });
    }

    async getById(id) {
        return await prisma.web_anexos_requisicao.findUnique({
            where: { id: Number(id) },
        });
    }

    async create(payload) {
        return await prisma.web_anexos_requisicao.create({
            data: payload,
        });
    }

    async update(id, payload) {
        return await prisma.web_anexos_requisicao.update({
            where: { id: Number(id) },
            data: payload,
        });
    }

    async delete(id) {
        return await prisma.web_anexos_requisicao.delete({
            where: { id: Number(id) },
        });
    }
}

module.exports = new RequisitionFileRepository();