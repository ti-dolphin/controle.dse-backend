const {prisma} = require('../database');


class KanbanStatusRequisitionRepository{ 
    async create(data) {
        return prisma.web_kanban_status_requisicao.create({data});
    }

    async update(id, data) {
        return prisma.web_kanban_status_requisicao.update({where: {id}, data});
    }

    async delete(id) {
        return prisma.web_kanban_status_requisicao.delete({where: {id}});
    }

    async getById(id) {
        return prisma.web_kanban_status_requisicao.findUnique({where: {id}});
    }

    async getMany(params) {
        return prisma.web_kanban_status_requisicao.findMany({ 
            where : params
        });
    }

}

module.exports = new KanbanStatusRequisitionRepository();