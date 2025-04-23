const pool = require("../database");
const ProjectRepository = require("../repositories/ProjectRepository");

class ProjectService {

  static async createProject(project){ 
      const {descricao } = project;
      const [result] = await this.executeQuery(
        `
          INSERT INTO PROJETOS (DESCRICAO, ATIVO)
          VALUES (?,1)
        `,
        [descricao]
      );
    return result.insertId;
  }
  static async getAllProjects() {
      return await ProjectRepository.getAllProjects();
  }

  static async getProjectById(id) {
    const query = `
      SELECT 
        * 
      FROM 
        PROJETOS 
      WHERE 
        ID = ?
    `;
    try {
      const [rows, fields] = await this.executeQuery(query, [id]);
      return rows;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  static async executeQuery(query, params = []) {
    const connection = await pool.getConnection();
    try {
      const [results, fields] = await connection.query(query, params);
      connection.release();
      return [results, fields];
    } catch (queryError) {
      console.log("queryError: ", queryError);
      connection.release();
      throw queryError;
    }
  }
}

module.exports = ProjectService;
