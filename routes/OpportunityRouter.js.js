const express = require("express");
const router = express.Router();
const OpportunityController = require('../controllers/OpportunityController');


//recupera oportunidae pela chave primária
router.get('/:CODOS', OpportunityController.getById);

//recupera oportunidades
router.get('/', OpportunityController.getMany);

router.get("/status/status_oportunidade", OpportunityController.getStatuses);

router.get('/relatorio/verificar_relatorio_semanal', OpportunityController.getReportInfo);

//criar nova oportunidade
router.post('/', OpportunityController.create);

//atualiza oportunidae
router.put('/:CODOS', OpportunityController.update);

//deleta oportunidade
router.delete('/:CODOS', OpportunityController.delete);


module.exports = router;