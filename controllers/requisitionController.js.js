const RequisitionService = require("../services/RequisitionService");

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

  async createFromOther(req, res) {
    console.log("createFromOther");
    try {
      const  {id_requisicao, items} = req.body;
      const requisition = await RequisitionService.createFromOther(id_requisicao, items);
      res.status(201).json(requisition);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
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

  async changeStatus(req, res){ 
    try {
      const { id_requisicao } = req.params;
      const { alterado_por, id_status_requisicao } = req.body;
      console.log("req body: ", req.body);
      const updated = await RequisitionService.changeStatus(
        Number(id_requisicao),
        Number(id_status_requisicao),
        Number(alterado_por),

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

  async cancel(req, res){ 
    try {
      const updated = await RequisitionService.cancel(Number(req.params.id_requisicao));
      if (!updated) {
        return res.status(404).json({ error: "Requisição não encontrada" });
      }
      res.status(200).json(updated);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }

  async activate(req, res){ 
    try {
      const updated = await RequisitionService.activate(Number(req.params.id_requisicao));
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
      console.log("error: ", error)
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new RequisitionController();
