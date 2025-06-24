const ChecklistMovementationItemService = require('../services/ChecklistMovementationItemService');

class ChecklistMovementationItemController {
  async create(req, res) {
    try {
      const item = await ChecklistMovementationItemService.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMany(req, res) {
    try {
      const items = await ChecklistMovementationItemService.getMany(req.query);
      res.json(items);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const item = await ChecklistMovementationItemService.getById(Number(req.params.id_item_checklist_movimentacao));
      if (!item) return res.status(404).json({ error: 'Item não encontrado' });
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const item = await ChecklistMovementationItemService.update(Number(req.params.id_item_checklist_movimentacao), req.body);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      await ChecklistMovementationItemService.delete(Number(req.params.id_item_checklist_movimentacao));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ChecklistMovementationItemController();
