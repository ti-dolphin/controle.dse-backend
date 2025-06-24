const RequisitionItemService = require("../services/RequisitionItemService");

class RequisitionItemController {
  async getMany(req, res) {
    try {
      const params = req.query;
      const items = await RequisitionItemService.getMany(params);
      res.json(items);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Erro interno do servidor: " + err.message });
    }
  }

  async getById(req, res) {
    try {
      const item = await RequisitionItemService.getById(
        Number(req.params.id_item_requisicao)
      );
      if (!item) {
        return res.status(404).json({ error: "Item não encontrado" });
      }
      res.json(item);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Erro interno do servidor: " + err.message });
    }
  }

  async create(req, res) {
    try {
      const payload = req.body;
      const newItem = await RequisitionItemService.create(payload);
      res.status(201).json(newItem);
    } catch (err) {
      res.status(400).json({ error: "Erro ao criar item: " + err.message });
    }
  }

  async update(req, res) {
    try {
      const payload = req.body;
      const updatedItem = await RequisitionItemService.update(
        Number(req.params.id_item_requisicao),
        payload
      );
      if (!updatedItem) {
        return res.status(404).json({ error: "Item não encontrado" });
      }
      res.json(updatedItem);
    } catch (err) {
      res.status(400).json({ error: "Erro ao atualizar item: " + err.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await RequisitionItemService.delete(
        Number(req.params.id_item_requisicao)
      );
      if (!deleted) {
        return res.status(404).json({ error: "Item não encontrado" });
      }
      res.json({ message: "Item excluído com sucesso" });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Erro interno do servidor: " + err.message });
    }
  }
}

module.exports = new RequisitionItemController();
