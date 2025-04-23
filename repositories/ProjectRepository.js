const { prisma } = require("../database");


class ProjectRepository {
    static async getAllProjects() {
        return await prisma.projetos.findMany({
            where: {
                ATIVO: 1
            }
        })
    }
}
module.exports = ProjectRepository;