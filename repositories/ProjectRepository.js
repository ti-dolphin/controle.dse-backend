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

    async getFollowers(ID) {
        return await prisma.web_seguidores_projeto.findMany({
            where: { id_projeto: Number(ID)},
            include: { 
                pessoa: {
                    select: {
                        CODPESSOA: true,
                        NOME: true,
                    }
                }
            }
        });
    }

    async create(projectData) {
        const newProject =  await prisma.projetos.create({
            data: projectData,
        });
        return newProject;
    }

    async update(ID, projectData) {
        return await prisma.projetos.update({
            where: { ID: Number(ID) },
            data: projectData,
        });
    }

    async deleteFollower(id_seguidor_projeto) {
        return await prisma.web_seguidores_projeto.delete({
            where: { id_seguidor_projeto: Number(id_seguidor_projeto) },
        });
    }

    async delete(ID) {
        return await prisma.projetos.delete({
            where: { ID: Number(ID) },
        });
    }

    async getProjectsFollowedByUser(COPESSOA) {
        return prisma.web_seguidores_projeto.findMany({ 
            where: {codpessoa: Number(COPESSOA)},
        })
    }
}

module.exports = new ProjectRepository();
