const {prisma} = require('../database');


class KanbanStatusRequisitionRepository{ 
    async create(data){
        return prisma.web_kanban_status_requisicao.create({data});
    }

    async update(id, data){
        return prisma.web_kanban_status_requisicao.update({where: {id}, data});
    }

    async delete(id){
        return prisma.web_kanban_status_requisicao.delete({where: {id}});
    }

    async getById(id){
        return prisma.web_kanban_status_requisicao.findUnique({where: {id}});
    }

    async getMany(params){
        const where = {};
        if(Object.keys(params).length > 0){ 
            where.id_kanban_requisicao = Number(params.id_kanban_requisicao);
        }
        return prisma.web_kanban_status_requisicao.findMany({ 
            where
        });
    }
}

module.exports = new KanbanStatusRequisitionRepository();