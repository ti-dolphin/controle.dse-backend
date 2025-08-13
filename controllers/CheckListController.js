const CheckListService = require("../services/CheckListService");

class CheckListController {
  async create(req, res) {
    try {
      const checklist = await CheckListService.create(req.body);
      res.status(201).json(checklist);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMany(req, res) {
    try {
      const checklists = await CheckListService.getMany(req.query);
      res.json(checklists);
    } catch (error) {
      
      res.status(400).json({ error: error.message });
    }
  }

  async getManyByUser(req, res) {
    try {
      const {codpessoa} = req.params
      const checklists = await CheckListService.getManyByUser(req.query, codpessoa);
      res.json(checklists);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const checklist = await CheckListService.getById(
        Number(req.params.id_checklist)
      );
      if (!checklist) {
        return res.status(404).json({ error: "Checklist não encontrado" });
      }

      res.json(checklist);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async verifyChecklistCreation(req, res) {
    try {
      const checklistCreationInfo = await CheckListService.verifyChecklistCreation();
      res.json(checklistCreationInfo);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }

   async verifyChecklistItems(req, res){ 
    try {
      const checklistWithItemsInserted = await CheckListService.verifyChecklistItems();
      res.json({ checklistWithItemsInserted });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }

  async sendChecklistEmails(req, res){ 
    try {
      const emailsSent = await CheckListService.sendChecklistEmails();
      res.json({ emailsSent });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }



  async update(req, res) {
    try {
      const checklist = await CheckListService.update(
        Number(req.params.id_checklist),
        req.body
      );
      res.json(checklist);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      await CheckListService.delete(Number(req.params.id_checklist));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new CheckListController();
