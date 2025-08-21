const RequisitionItemService = require("../services/RequisitionItemService");

class RequisitionItemController {
  getMany = async (req, res) => {
    try {
      let { searchTerm, id_requisicao, id_item_requisicao } = req.query;
      id_item_requisicao = this.normalizeReqItemParam(id_item_requisicao);
      const items = await RequisitionItemService.getMany(
        {
          id_requisicao: Number(id_requisicao),
          id_item_requisicao,
        },
        searchTerm
      );
      res.json(items);
    } catch (err) {
      ;
      res
        .status(500)
        .json({ error: "Erro interno do servidor: " + err.message });
    }
  };

  getById = async (req, res) => {
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
  };

  getDinamicColumns = async (req, res) => {
    const { id_requisicao } = req.params;
    try {
      const columns = await RequisitionItemService.getDinamicColumns(
        Number(id_requisicao)
      );
      res.json(columns);
    } catch (err) {
      ;
      res
        .status(500)
        .json({ error: "Erro interno do servidor: " + err.message });
    }
  };

  normalizeReqItemParam = (id_item_requisicao) => {
    let normalizedIdItemRequisicaoParam = {};
    if (id_item_requisicao && id_item_requisicao.in) {
      if (Array.isArray(id_item_requisicao.in)) {
        //(['801', '802', '803'])
        normalizedIdItemRequisicaoParam = {
          in: id_item_requisicao.in.map((id) => Number(id)),
        };
      } else {
        //({'0': '750', '1': '751', ...})
        normalizedIdItemRequisicaoParam = {
          in: Object.values(id_item_requisicao.in).map((id) => Number(id)),
        };
      }
    }
    return normalizedIdItemRequisicaoParam;
  };

  create = async (req, res) => {
    try {
      const payload = req.body;
      const newItem = await RequisitionItemService.create(payload);
      res.status(201).json(newItem);
    } catch (err) {
      res.status(400).json({ error: "Erro ao criar item: " + err.message });
    }
  };

  createMany = async (req, res) => {
    try {
      const productIds = req.body;
      const { id_requisicao } = req.query;
      const newItemIds = await RequisitionItemService.createMany({
        productIds,
        id_requisicao: Number(id_requisicao),
      });

      res.status(201).json(newItemIds);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  };

  update = async (req, res) => {
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
      console.log(err);
      res.status(400).json({ error: "Erro ao atualizar item: " + err.message });
    }
  };

  updateShippingDate = (req, res) => {
    try {
      const { ids, date } = req.body;
      const updatedItems = RequisitionItemService.updateShippingDate(ids, date);
      res.json(updatedItems);
    } catch (err) {
      res
        .status(400)
        .json({ error: "Erro ao atualizar data de entrega: " + err.message });
    }
  };

  updateOCS = async (req, res) => {
    try {
      const { ids, oc } = req.body;
      const updatedItems = await RequisitionItemService.updateOCS(ids, oc);
      res.json(updatedItems);
    } catch (err) {
      res.status(400).json({ error: "Erro ao preencher oc's: " + err.message });
    }
  };

  updateQuoteItemsSelected = async (req, res) => {
    try {
      const quoteItemsSelectedMap = req.body;
      const { id_requisicao } = req.query;
      const { updatedItems, updatedRequisition } =
        await RequisitionItemService.updateQuoteItemsSelected(
          Number(id_requisicao),
          quoteItemsSelectedMap
        );
      res.json({ updatedItems, updatedRequisition });
    } catch (err) {
      console.log(err);
      res.status(400).json({ error: "Erro ao preencher oc's: " + err.message });
    }
  };

  delete = async (req, res) => {
    try {
      const deleted = await RequisitionItemService.delete(
        Number(req.params.id_item_requisicao)
      );
      if (!deleted) {
        return res.status(404).json({ error: "Item não encontrado" });
      }
      res.json({ message: "Item excluído com sucesso" });
    } catch (err) {
      ;
      res
        .status(500)
        .json({ error: "Erro interno do servidor: " + err.message });
    }
  };
}

module.exports = new RequisitionItemController();

