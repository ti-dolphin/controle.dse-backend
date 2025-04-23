const { json } = require("express");
const pool = require("../database");

const ProjectService = require("../services/ProjectService");

class ProjectController {
  static async getAllProjects(req, res) {
    try {
      const projects = await ProjectService.getAllProjects();
      return res.status(200).send(projects);
    } catch (err) {
      console.log("Erro ao buscar projetos: ", err);
      res.status(500).send("Erro no servidor");
    }
  }

  static async getProjectById(req, res) {
    const { id } = req.params;
    try {
      const project = await ProjectService.getProjectById(id);
      if (project) {
        res.status(200).send(project);
      } else {
        res.status(404).send("Project not found");
      }
    } catch (err) {
      console.log("Error in getProjectById: ", err);
      res.status(500).send("Internal Server Error");
    }
  }
}

module.exports = ProjectController;
