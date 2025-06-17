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
          const params = req.query;
          const opportunities = await OpportunityService.getMany(params);
          res.json(opportunities);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      }

       async create(req, res) {
        try {
          const opportunity = await OpportunityService.create(req.body);
          res.status(201).json(opportunity);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      }

       async update(req, res) {
        try {
          const { CODOS } = req.params;
          const updatedOpportunity = await OpportunityService.update(
            Number(CODOS),
            req.body
          );
          if (!updatedOpportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
          }
          res.json(updatedOpportunity);
        } catch (error) {
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
          res.status(500).json({ message: error.message });
        }
      }
}

module.exports = new OpportunityController();
