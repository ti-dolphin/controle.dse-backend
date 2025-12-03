const RequisitionService = require("../services/RequisitionService");
const RequisitionStatusService = require("../services/RequisitionStatusService");

class RequisitionController {
  async getMany(req, res) {
    try {
        const params = req.query.params;

        let user = req.query.user;

        if (params?.removeAdmView) {
          user.PERM_ADMINISTRADOR = 'false'
        }

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

  async attend(req, res){ 
    try{ 
      const {estoque, compras} = await RequisitionService.attend(Number(req.params.id_requisicao), req.body.items);

      res.status(200).json({estoque, compras});
    }catch(e){ 
      console.error(e);
      res.status(400).json({ error: e.message });
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
      const { alterado_por, id_status_requisicao, is_reverting } = req.body;
      const updated = await RequisitionService.changeStatus(
        Number(id_requisicao),
        Number(id_status_requisicao),
        Number(alterado_por),
        Boolean(is_reverting)
      );
      if (!updated) {
        return res.status(404).json({ error: "Requisição não encontrada" });
      }
      res.status(200).json(updated);
    } catch (error) {
      console.error(error);
      
      // Retorna erro estruturado para aumento de valor
      if (error.code === 'VALUE_INCREASE_REQUIRES_APPROVAL') {
        return res.status(400).json({ 
          code: error.code,
          message: error.message,
          details: error.details
        });
      }
      
      res.status(400).json({ error: error.message });
    }
  }

  async revertToPreviousStatus(req, res) {
    try {
      const { id_requisicao } = req.params;
      const { motivo } = req.body;
      const { user } = req.query;

      const result = await RequisitionStatusService.revertToPreviousStatus(
        Number(id_requisicao),
        user,
        motivo
      );
      res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao reverter status:', error);
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

  async updateRequisitionType(req, res) {
    try {
      const { id_requisicao } = req.params;
      const { id_tipo_faturamento, id_status_requisicao } = req.body;
      
      const updated = await RequisitionService.updateRequisitionType(
        Number(id_requisicao),
        Number(id_tipo_faturamento),
        Number(id_status_requisicao)
      );
      
      if (!updated) {
        return res.status(404).json({ error: "Requisição não encontrada" });
      }
      
      res.status(200).json(updated);
    } catch (error) {
      console.error('Erro ao atualizar tipo de faturamento:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async updateRequisitionTypeWithSplit(req, res) {
    try {
      const { id_requisicao } = req.params;
      const { id_tipo_faturamento, id_status_requisicao, validItemIds } = req.body;
      
      const result = await RequisitionService.updateRequisitionTypeWithSplit(
        Number(id_requisicao),
        Number(id_tipo_faturamento),
        Number(id_status_requisicao),
        validItemIds
      );
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao atualizar tipo de faturamento com divisão:', error);
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

  // Controller para faturamento

  async getAllFaturamentosTypes(req, res) {
    try {
      // Corrigido: buscar em req.query.visivel
      const { visivel } = req.query;1
      const types = await RequisitionService.getAllFaturamentosTypes(
        visivel !== undefined ? Number(visivel) : 1
      );
      res.status(200).json(types);
    } catch (error) {
      console.error('Erro ao obter tipos de faturamento:', error);
      res.status(500).json({ error: error.message });
    }
  }


}

module.exports = new RequisitionController();
