const PatrimonyRepository = require("../repositories/PatrimonyRepository");
const pool = require("../database");
const fireBaseService = require("./fireBaseService");
const opcoes = {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
};

class PatrimonyService {
  static async deletePatrimony(patrimonyId) {
    try {
      const result = await this.executeQuery(
        PatrimonyRepository.deletePatrimonyQuery(),
        [patrimonyId]
      );
      return result.affectedRows;
    } catch (e) {
      console.error("Error in PatrimonyService.deletePatrimony:", e);
      throw e;
    }
  }

  static async getInactivePatrymonyInfo() {
    const getInactivePatrymonyInfoQuery = await this.executeQuery(
      PatrimonyRepository.getInactivePatrymonyInfoQuery()
    );

    return getInactivePatrymonyInfoQuery;
  }

  static async updatePatrimonies(ids, active) {
    if (!active) {
      const affectedRows = await this.executeQuery(
        PatrimonyRepository.updatePatrimonies(),
        [0, ids]
      );
      return affectedRows;
    }
    const affectedRows = await this.executeQuery(
      PatrimonyRepository.updatePatrimonies(),
      [1, ids]
    );
    return affectedRows;
  }

  static async getPatrimonyResponsable(patrimonyId) {
    const responsable = await this.executeQuery(
      PatrimonyRepository.getPatrimonyResponsable(),
      [patrimonyId]
    );
    return responsable;
  }

  static async getPatrimonyType() {
    try {
      const patrimonyTypes = await this.executeQuery(
        PatrimonyRepository.getPatrimonyTypeQuery()
      );
      return patrimonyTypes;
    } catch (error) {
      throw new Error("Error fetching patrimony types from repository");
    }
  }

  static async deletePatrimonyFile(patrimonyFileId, filename) {
    const result = await this.executeQuery(
      PatrimonyRepository.deletePatrimonyFileQuery(),
      [patrimonyFileId]
    );
    try{
      await fireBaseService.deleteFileByName(filename);
    }catch(e){
      console.log(e);
    }
    return result.affectedRows;
  }

  static async createPatrimonyFile(patrimonyId, file) {
    const { path, filename } = file;
    const fileUrl = await this.getFileUrl(path, filename);

    const result = await this.executeQuery(
      PatrimonyRepository.createPatrimonyFileQuery(),
      [fileUrl, filename, patrimonyId]
    );
    return result.insertId;
  }

  static async getFileUrl(path, filename) {
    await fireBaseService.uploadFileToFireBase(path);
    const [allFiles] = await fireBaseService.getFilesFromFirebase();
    const createdFile = allFiles.find((item) => item.name === filename);
    return createdFile.publicUrl();
  }

  static async getPatrimonyFiles(patrimonyId) {
    const result = await this.executeQuery(
      PatrimonyRepository.getPatrimonyFilesQuery(),
      [patrimonyId]
    );
    return result;
  }

  static async getSinglePatrimonyInfo(patrimonyId) {
    const result = await this.executeQuery(
      PatrimonyRepository.getSinglePatrimonyInfo(),
      [patrimonyId]
    );

    return result;
  }

  static async updatePatrimony(patrimony) {
    const {
      id_patrimonio,
      nome,
      data_compra,
      nserie,
      descricao,
      pat_legado,
      ativo,
      valor_compra,
      fabricante,
      id_produto,
    } = patrimony;
   
    const result = await this.executeQuery(
      PatrimonyRepository.updatePatrimonyQuery(),
      [
        nome,
        new Date(data_compra)
          .toLocaleDateString("sv-SE", opcoes)
          .replace("T", " ")
          .replace(/ .*/, ""),
        nserie,
        descricao,
        pat_legado,
        ativo,
        valor_compra,
        fabricante,
        id_produto,
        id_patrimonio,
      ]
    );
    return result.affectedRows;
  }

  static async getPatrimonyInfo(queryParams) {
    try {
      if (queryParams.filter === "Meus") {
        const [rows] = await this.executeQuery(
          PatrimonyRepository.getPatrimonyInfoQueryByResponsable(),
          [queryParams.user.CODPESSOA]
        );
        return rows;
      }
      const [rows] = await this.executeQuery(
        PatrimonyRepository.getPatrimonyInfoQuery()
      );
      if (rows) return rows;
    } catch (e) {
      ;
      return null;
    }
  }

  static async createPatrimony(newPatrimony) {
    const {
      nome,
      data_compra, // This should be in ISO date string format, e.g., "2024-08-09"
      nserie,
      descricao,
      pat_legado,
      tipo,
      fabricante,
      valor_compra,
    } = newPatrimony;

    const purchaseDate = new Date(data_compra)
      .toLocaleDateString("sv-SE", opcoes)
      .replace("T", " ")
      .replace(/ .*/, "");
    try {
      if (data_compra !== "") {
        const result = await this.executeQuery(
          PatrimonyRepository.createPatrimonyQuery(),
          [
            nome,
            purchaseDate,
            nserie,
            descricao,
            pat_legado,
            tipo,
            fabricante,
            valor_compra
          ]
        );
        if (result) return result.insertId;
      }
      const result = await this.executeQuery(
        PatrimonyRepository.createPatrimonyQueryNoPurchaseData(),
        [nome, nserie, descricao, pat_legado, tipo, fabricante, valor_compra]
      );
      if (result) return result.insertId;
    } catch (e) {
      console.log("error in PatrimonyService.createPatrimony: m", e);
    }
  }

  static async executeQuery(query, params) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(query, params);
      connection.release();
      return result;
    } catch (queryError) {
      console.log("Error in executeQuery: ", queryError);
      connection.release();
      throw queryError;
    }
  }
}

module.exports = PatrimonyService;
