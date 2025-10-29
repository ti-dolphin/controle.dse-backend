const { prisma } = require("../database");

class ProjectRepository {
    async getMany(params) {
        return await prisma.pROJETOS.findMany({
            where: {...params, AND : [{ATIVO : 1}]},
        });
    }

    async getById(ID) {
        return await prisma.pROJETOS.findUnique({
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
        const newProject = await prisma.pROJETOS.create({
          data: projectData
        });
        return newProject;
    }

    async update(ID, projectData) {
        return await prisma.pROJETOS.update({
          where: { ID: Number(ID) },
          data: projectData,
        });
    }

    async deleteFollower(id_seguidor_projeto) {
        return await prisma.web_seguidores_projeto.delete({
            where: { id_seguidor_projeto: Number(id_seguidor_projeto) },
        });
    }
    async addFollower(projectData) {
        return await prisma.web_seguidores_projeto.create({
          data: {
            ativo: true,
            ...projectData,
          },
          include: {
            pessoa: {
              select: {
                CODPESSOA: true,
                NOME: true,
              },
            },
          },
        });
    }

    async delete(ID) {
        return await prisma.pROJETOS.delete({
          where: { ID: Number(ID) },
        });
    }

    async getProjectsFollowedByUser(COPESSOA) {
        return prisma.web_seguidores_projeto.findMany({ 
            where: {codpessoa: Number(COPESSOA)},
        })
    }

    async isUserProjectCoordinator(CODPESSOA) {
        return await prisma.pROJETOS.findMany({
            where: {
                ID_RESPONSAVEL: Number(CODPESSOA),
                ATIVO: 1
            }
        });
    }
}

module.exports = new ProjectRepository();
