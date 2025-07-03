const RequisitionTypeService = require("../services/RequisitionTypeService");

const RequisitionTypeController = {
  async getMany(req, res) {
    try {
      const tipos = await RequisitionTypeService.findMany();
      return res.status(200).json(tipos);
    } catch (error) {
      return res
        .status(500)
        .json({ mensagem: "Erro ao buscar tipos de requisição." });
    }
  },

  async getById(req, res) {
    try {
      const { id_tipo_requisicao } = req.params;
      const tipo = await RequisitionTypeService.findById(
        Number(id_tipo_requisicao)
      );
      if (!tipo) {
        return res
          .status(404)
          .json({ mensagem: "Tipo de requisição não encontrado." });
      }
      return res.status(200).json(tipo);
    } catch (error) {
      return res
        .status(500)
        .json({ mensagem: "Erro ao buscar tipo de requisição." });
    }
  },

  async Create(req, res) {
    try {
      const createdType = await RequisitionTypeService.create(req.body);
      return res.status(201).json(createdType);
    } catch (error) {
      return res
        .status(500)
        .json({ mensagem: "Erro ao criar tipo de requisição." });
    }
  },

  async Update(req, res) {
    try {
      const { id_tipo_requisicao } = req.params;
      const updatedType = await RequisitionTypeService.update(
        Number(id_tipo_requisicao),
        req.body
      );
      if (!updatedType) {
        return res.status(404).json();
      }
      return res.status(200).json(updatedType);
    } catch (error) {
      return res
        .status(500)
        .json({ mensagem: "Erro ao atualizar tipo de requisição." });
    }
  },

  async Delete(req, res) {
    try {
      const { id_tipo_requisicao } = req.params;
      const deletado = await RequisitionTypeService.delete(
        Number(id_tipo_requisicao)
      );
      if (!deletado) {
        return res
          .status(404)
          .json({
            mensagem: "Tipo de requisição não encontrado para exclusão.",
          });
      }
      return res
        .status(200)
        .json({ mensagem: "Tipo de requisição excluído com sucesso." });
    } catch (error) {
      return res
        .status(500)
        .json({ mensagem: "Erro ao excluir tipo de requisição." });
    }
  },
};

module.exports = RequisitionTypeController;
