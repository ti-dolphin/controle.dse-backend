const RequisitionService = require("../services/RequisitionService");

class RequisitionController {
  async getMany(req, res) {
    try {
        const params = req.query;
      const requisitions = await RequisitionService.getMany(params);
      res.status(200).json(requisitions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const requisition = await RequisitionService.getById(req.params.id);
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
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await RequisitionService.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Requisição não encontrada" });
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await RequisitionService.delete(req.params.id);
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
