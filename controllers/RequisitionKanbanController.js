const RequisitionKanbanService = require("../services/RequisitionKanbanService");

class RequisitionKanbanController {
  async create(req, res) {
    try {
      const kanban = await RequisitionKanbanService.create(req.body);
      res.status(201).json(kanban);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMany(req, res) {
    try {
      const kanbans = await RequisitionKanbanService.getMany(req.query);
      res.json(kanbans);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const kanban = await RequisitionKanbanService.getById(Number(req.params.id_kanban_requisicao));
      if (!kanban) return res.status(404).json({ error: 'Kanban não encontrado' });
      res.json(kanban);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const kanban = await RequisitionKanbanService.update(Number(req.params.id_kanban_requisicao), req.body);
      res.json(kanban);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      await RequisitionKanbanService.delete(Number(req.params.id_kanban_requisicao));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new RequisitionKanbanController();
