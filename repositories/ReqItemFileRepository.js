const {prisma} = require('../database')
const { buildWhere } = require('../utils');

class ReqItemFileRepository {
     async getMany(params = {}) {
        const where = buildWhere(params, ['id', 'id_item_requisicao']);
        return prisma.web_anexos_item_requisicao.findMany({ where });
    }

     async getById(id) {
        return prisma.web_anexos_item_requisicao.findUnique({
            where: { id: id }
        });
    }

     async create(payload) {
        return prisma.web_anexos_item_requisicao.create({
            data: payload
        });
    }

     async update(id, payload) {
        return prisma.web_anexos_item_requisicao.update({
            where: { id: id },
            data: payload
        });
    }

     async delete(id) {
        return prisma.web_anexos_item_requisicao.delete({
            where: { id: id }
        });
    }
}

module.exports = new  ReqItemFileRepository();