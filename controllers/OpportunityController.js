const OpportunityService = require("../services/OpportunityService");
const PersonService = require("../services/PersonService");
class OpportunityController {

  static sendSaleEmail = async (req, res) => {

    const { codOs, user } = req.query;
    try {
      const opportunity = await OpportunityService.getOpportunityById(codOs);
      await OpportunityService.sendSoldOpportunityEmail(codOs, opportunity.codStatus, opportunity, opportunity, user, true)
      return res.status(200).send({ message: 'Email enviado com sucesso!' })
    } catch (e) {
      console.log(e)
      return res.status(500).send("Server Error");
    }
  }
  //getOpportunityById
  static getOpportunityById = async (req, res) => {
    try {
      const opportunity = await OpportunityService.getOpportunityById(
        req.params.oppId
      );
      if (!opportunity) {
        return res.status(404).send("Opportunity not found");
      }
      return res.status(200).send(opportunity);
    } catch (e) {
      console.error("Error getting opportunity: ", e.message);
      return res.status(500).send("Server Error");
    }
  };

  static getManagers = async (req, res) => {
    try {
      const managers = await PersonService.getAllManagers();
      return res.status(200).send(managers);
    } catch (e) {
      return res.status(500).send("Server Error");
    }
  }

  static getOpportunityFiles = async (req, res) => {
    try {
      const files = await OpportunityService.getOpportunityFiles(
        req.query.oppId
      );
      return res.status(200).send(files);
    } catch (e) {
      console.error("Error getting opportunity files: ", e.message);
      return res.status(500).send("Server Error");
    }
  };

  static uploadFiles = async (req, res) => {
    const { files } = req;
    try {
      if (files.length) {
        const { files } = req;
        await OpportunityService.createOpportunityFiles(
          req.query.oppId,
          files
        );
        return res.status(200).send({
          message: "files inserted successfully"
        });
      }
      return res.status(200).send({ message: 'No files were sent' })
    } catch (e) {
      console.log("Error uploading files: ", e);
      return res.status(500).send({ message: "Error uploading files" });
    }
  };

  static createOpportunity = async (req, res) => {
    try {
      const response = await OpportunityService.createOpportunity(req.body);
      return res.status(200).send({
        message: "Opportunity created successfully",
        adicional: response.adicional,
        codOs: response.codOs,
      });
    } catch (e) {
      console.error("Error creating opportunity: ", e.message);
      return res.status(500).send("Server Error");
    }
  };

  static updateOpportunity = async (req, res) => {
    console.log('REQ.BODY UPDATE: ', req.body)
    const updatedOpportunity = req.body;
    const { user } = req.query;

    try {
      const affectedRows = await OpportunityService.updateOpportunity(
        updatedOpportunity,
        user
      );
      return res.status(200).send({ message: "Opportunity updated successfully!" });
    } catch (e) {
      console.error("Error updating opportunity: ", e.message);
      return res.status(500).send("Server Error");
    }
  };

  static getOppsByComercialResponsable = async (req, res) => {
    try {
      const oppsByResponsable = await OpportunityService.getOppsByComercialResponsable();
      await OpportunityService.sendSalesReportEmail(oppsByResponsable);
      return res.status(200).send(oppsByResponsable);
    } catch (e) {
      console.log(e)
      res.status(500).send('Server Error')
    }
  }

  static getOppsByManager = async (req, res) => {
    try {
      const oppsByManager = await OpportunityService.getOppsByManager();
      await OpportunityService.sendManagerOppExpirationEmail(oppsByManager);
      return res.status(200).send(oppsByManager);
    } catch (e) {
      console.log(e);
      res.status(500).send('Server Error');
    }
  }

  static createOpportuntiyFile = async (req, res) => {
    const file = req.file;
    if (!file) {
      return res.status(400).send("No file uploaded");
    }
    try {
      const insertId = await OpportunityService.createOpportunityFiles(
        req.params.id,
        file
      );
      return res.status(200).send({ message: "File uploaded successfully!" });
    } catch (e) {
      console.error("Error uploading file: ", e.message);
      return res.status(500).send("Server Error");
    }
  };

  static getClients = async (req, res) => {
    const { projectId } = req.query;
    try {
      const clients = await PersonService.getClients(projectId);
      return res.status(200).send(clients);
    } catch (err) {
      console.log("error getting clients: ", err.message);
      res.status(500).json({ error: err.message });
    }
  };

  static getStatusList = async (req, res) => {
    try {
      const statusList = await OpportunityService.getOppStatusList();
      return res.status(200).send(statusList);
    } catch (e) {
      console.log("error getting status list: ", e.message);
      res.status(500).json({ error: e.message });
    }
  };

  static getSalers = async (req, res) => {
    const { projectId } = req.query;
    try {
      const salers = await PersonService.getSallers(projectId);
      return res.status(200).send(salers);
    } catch (err) {
      console.log("error getting sales: ", err.message);
      res.status(500).json({ error: e.message });
    }
  };

  static getOpportunities = async (req, res) => {
    try {
      const opps = await OpportunityService.getOpportunities(req);
      return res.status(200).send(opps);
    } catch (e) {
      console.log("error getting opportunities: ", e.message);
      res.status(500).json({ error: e.message });
    }
  };
}

module.exports = OpportunityController;
