const RequisitionStatusService = require("../services/RequisitionStatusService");

class RequisitionStatusController {
  async create(req, res) {
    try {
      const status = await RequisitionStatusService.create(req.body);
      res.status(201).json(status);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMany(req, res) {
    try {
      const statuses = await RequisitionStatusService.getMany(req.query);
      res.json(statuses);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const status = await RequisitionStatusService.getById(Number(req.params.id_status_requisicao));
      if (!status) return res.status(404).json({ error: 'Status não encontrado' });
      res.json(status);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const status = await RequisitionStatusService.update(Number(req.params.id_status_requisicao), req.body);
      res.json(status);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      await RequisitionStatusService.delete(Number(req.params.id_status_requisicao));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new RequisitionStatusController();
