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

  async getStatusPermission(req, res){
    ;
    const {user, requisition} = req.query;
    try{ 
       const permissions = await RequisitionStatusService.getStatusPermission(user, requisition);
       res.json(permissions);
    }catch(e){ 
      
      res.status(400).json({error: e.message});
    }
  }
  async getStatusAlteration(req, res){
    ;
    const {id_requisicao} = req.query;
    try{ 
        const alterations = await RequisitionStatusService.getStatusAlteration(Number(id_requisicao));
 
        res.json(alterations);
    }catch(e){ 
      
      res.status(400).json({error: e.message});
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

  async updateRequisitionStatus(req, res){ 
    const {id_status_requisicao, id_requisicao} = req.body;
    try{ 
      const status = await RequisitionStatusService.updateRequisitionStatus(
        Number(id_status_requisicao),
        Number(id_requisicao)
      );
      res.json(status);
    }catch(e){ 
      res.status(400).json({error: e.message});
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
