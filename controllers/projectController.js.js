const { json } = require("express");


const ProjectService = require("../services/ProjectService");

class ProjectController {
    async getMany(req, res) {
        try {
            const params = req.query;
            const projects = await ProjectService.getMany(params);
            res.json(projects);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getById(req, res) {
        try {
            const { ID } = req.params;
            const project = await ProjectService.getById(ID);
            if (!project) {
                return res.status(404).json({ error: "Projeto não encontrado" });
            }
            res.json(project);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getFollowers(req, res) {
        console.log("get followers")
        try {
            const { ID } = req.params;
            const followers = await ProjectService.getFollowers(ID);
            res.json(followers);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
    }

    async deleteFollower(req, res) {
        console.log("delete follower")
        try {
            console.log(req.params)
            const { id_seguidor_projeto } = req.params;
            const follower = await ProjectService.deleteFollower(Number(id_seguidor_projeto));
            res.json(follower);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
    }

    async create(req, res) {
        try {
            const projectData = req.body;
            const newProject = await ProjectService.create(projectData);
            res.status(201).json(newProject);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async update(req, res) {
        try {
            const { ID } = req.params;
            const projectData = req.body;
            const updatedProject = await ProjectService.update(ID, projectData);
            if (!updatedProject) {
                return res.status(404).json({ error: "Projeto não encontrado" });
            }
            res.json(updatedProject);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async delete(req, res) {
        try {
            const { ID } = req.params;
            const deleted = await ProjectService.delete(ID);
            if (!deleted) {
                return res.status(404).json({ error: "Projeto não encontrado" });
            }
            res.json({ message: "Projeto excluído com sucesso" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new ProjectController();
