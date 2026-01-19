const express = require("express");
const router = express.Router();
const OpportunityController = require('../controllers/OpportunityController');


//recupera oportunidades
router.get('/', OpportunityController.getMany);

router.get("/status/status_oportunidade", OpportunityController.getStatuses);

router.get('/relatorio/verificar_relatorio_semanal', OpportunityController.getReportInfo);

// busca propostas semelhantes (deve vir ANTES de /:CODOS)
router.get('/similar/buscar', OpportunityController.findSimilar);

//recupera oportunidae pela chave primária
router.get('/:CODOS', OpportunityController.getById);

//criar nova oportunidade
router.post('/', OpportunityController.create);

//atualiza oportunidae
router.put('/:CODOS', OpportunityController.update);

//deleta oportunidade
router.delete('/:CODOS', OpportunityController.delete);

// informar ganho (envio de email de ganho)
router.post('/:CODOS/informar-ganho', OpportunityController.sendSoldOpportunityEmail);


module.exports = router;