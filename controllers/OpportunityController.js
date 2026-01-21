const OpportunityService = require('../services/OpportunityService');


class OpportunityController {
       async getById(req, res) {
        try {
          const { CODOS } = req.params;
          const opportunity = await OpportunityService.getById(Number(CODOS));
          if (!opportunity) {
            return res.status(404).json({ message: 'Oportunidade não encontrada' });
          }
          res.json(opportunity);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      }

       async getMany(req, res) {
        try {
          const { opps, total, totalFatDolphin, totalFatDireto } = await OpportunityService.getMany(req.query);
          console.log({ 
            total,
            totalFatDolphin,
            totalFatDireto
          })
          res.json({ opps, total, totalFatDolphin, totalFatDireto });
        } catch (error) {
          console.error('Erro ao buscar oportunidades:', error);
          res.status(500).json({ message: error.message });
        }
      }

      async getStatuses(req, res){ 
        try {
          const statuses = await OpportunityService.getStatuses();
          res.json(statuses);
        } catch (error) {
          ;
          res.status(500).json({ message: error.message });
        }
      }

      async getReportInfo(req, res){ 
        console.log("getReportInfo");
        try {
          const reportInfo = await OpportunityService.verifyOpps();
          res.json(reportInfo);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: error.message });
        }
      }

      /**
       * Busca propostas semelhantes dentro do mesmo projeto
       * GET /oportunidades/similar?projectId=X&searchTerm=Y&excludeCodos=Z
       */
      async findSimilar(req, res) {
        try {
          const { projectId, searchTerm, excludeCodos } = req.query;
          
          if (!projectId || !searchTerm) {
            return res.status(400).json({ 
              message: 'Parâmetros projectId e searchTerm são obrigatórios' 
            });
          }

          const similarOpps = await OpportunityService.findSimilarByProject(
            Number(projectId),
            searchTerm,
            excludeCodos ? Number(excludeCodos) : null
          );

          res.json(similarOpps);
        } catch (error) {
          console.error('Erro ao buscar propostas semelhantes:', error);
          res.status(500).json({ message: error.message });
        }
      }

       async create(req, res) {
        try {
          const {isAdicional} = req.query;
        
          const opportunity = await OpportunityService.create(
            req.body,
            isAdicional === 'true'
          );
          res.status(201).json(opportunity);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: error.message });
        }
      }

       async update(req, res) {
        try {
          const { CODOS } = req.params;
          const user = req.body.user; // extrai do body
          const updatedOpportunity = await OpportunityService.update(
            Number(CODOS),
            req.body,
            user
          );
          if (!updatedOpportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
          }
          res.json(updatedOpportunity);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: error.message });
        }
      }

       async delete(req, res) {
        try {
          const { CODOS } = req.params;
          const deleted = await OpportunityService.delete(Number(CODOS));
          if (!deleted) {
            return res.status(404).json({ message: 'Opportunity not found' });
          }
          res.json({ message: 'Opportunity deleted successfully' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: error.message });
        }
      }

      async sendSoldOpportunityEmail(req, res) {
        try {
          const { CODOS } = req.params;
          const data = req.body;
          const user = req.body.user; // extrai do body
          await OpportunityService.sendSoldOpportunityEmail(Number(CODOS), data, user);
          res.status(200).json({ success: true, message: "E-mail de ganho enviado com sucesso!" });
        } catch (e) {
          res.status(500).json({ success: false, message: "Erro ao enviar e-mail de ganho", error: e.message });
        }
      }
}

module.exports = new OpportunityController();
