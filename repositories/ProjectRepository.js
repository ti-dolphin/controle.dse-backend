const { prisma } = require("../database");

class ProjectRepository {
    async getMany(params) {
        return await prisma.projetos.findMany({
            where: {...params, AND : [{ATIVO : 1}]},
        });
    }

    async getById(ID) {
        return await prisma.projetos.findUnique({
            where: { ID: Number(ID) },
        });
    }

    async create(projectData) {
        return await prisma.projetos.create({
            data: projectData,
        });
    }

    async update(ID, projectData) {
        return await prisma.projetos.update({
            where: { ID: Number(ID) },
            data: projectData,
        });
    }

    async delete(ID) {
        return await prisma.projetos.delete({
            where: { ID: Number(ID) },
        });
    }
}

module.exports = new ProjectRepository();
