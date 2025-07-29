const RequisitionService = require("../services/requisitionService");

class RequisitionController {
  async getMany(req, res) {
    try {
        const params = req.query.params;
        const user = req.query.user;
        
      const requisitions = await RequisitionService.getMany(user, params);

      res.status(200).json(requisitions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const requisition = await RequisitionService.getById(
        Number(req.params.id_requisicao)
      );
      if (!requisition) {
        return res.status(404).json({ error: "Requisição não encontrada" });
      }
      res.status(200).json(requisition);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const requisition = await RequisitionService.create(req.body);
      res.status(201).json(requisition);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    console.log("update requisition");
    try {
      const updated = await RequisitionService.update(
        Number(req.params.id_requisicao),
        req.body
      );
      if (!updated) {
        return res.status(404).json({ error: "Requisição não encontrada" });
      }
      res.status(200).json(updated);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await RequisitionService.delete(
        Number(req.params.id_requisicao)
      );
      if (!deleted) {
        return res.status(404).json({ error: "Requisição não encontrada" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new RequisitionController();
