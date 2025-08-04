const pool = require("../database");
const ProjectRepository = require("../repositories/ProjectRepository");

class ProjectService {
    async getMany(params) {
        return await ProjectRepository.getMany(params);
    }

    async getById(ID) {
        return await ProjectRepository.getById(ID);
    }

    async getFollowers(ID) {
        return await ProjectRepository.getFollowers(ID);
    }

    async deleteFollower(id_seguidor_projeto) {
        return await ProjectRepository.deleteFollower(id_seguidor_projeto);
    }

    async addFollower(projectData) {
        return await ProjectRepository.addFollower(projectData);
    }

    async create(projectData) {
        return await ProjectRepository.create(projectData);
    }

    async update(ID, projectData) {
        return await ProjectRepository.update(ID, projectData);
    }

    async delete(ID) {
        return await ProjectRepository.delete(ID);
    }

}

module.exports = new ProjectService();
