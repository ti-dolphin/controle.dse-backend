const {prisma} = require('../database');
const { buildWhere } = require('../utils');

class PatrimonyFileRepository {
    async getMany(params) {
        const where = buildWhere(params, ['id_patrimonio']);
        return prisma.web_anexos_patrimonio.findMany({ where });
    }

    async getById(id_anexo_patrimonio) {
        return prisma.web_anexos_patrimonio.findUnique({
            where: { id_anexo_patrimonio }
        });
    }

    async create(data) {
        return prisma.web_anexos_patrimonio.create({
            data: {
                arquivo: data.arquivo,
                nome_arquivo: data.nome_arquivo,
                id_patrimonio: data.id_patrimonio ? Number(data.id_patrimonio) : null
            }
        });
    }

    async update(id_anexo_patrimonio, data) {
        return prisma.web_anexos_patrimonio.update({
            where: { id_anexo_patrimonio: Number(id_anexo_patrimonio) },
            data: {
                arquivo: data.arquivo,
                nome_arquivo: data.nome_arquivo,
                id_patrimonio: data.id_patrimonio ? Number(data.id_patrimonio) : null
            }
        });
    }

    async delete(id_anexo_patrimonio) {
        return prisma.web_anexos_patrimonio.delete({
            where: { id_anexo_patrimonio: Number(id_anexo_patrimonio) }
        });
    }
}

module.exports = new PatrimonyFileRepository();