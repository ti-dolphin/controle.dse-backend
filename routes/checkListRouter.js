//checklistRouter
var express = require("express");
var router = express.Router();
const CheckListController = require('../controllers/CheckListController');

router.post("/", CheckListController.create);
router.get("/", CheckListController.getMany);
router.get("/:id_checklist", CheckListController.getById);
router.get('/:codpessoa/by_usuario', CheckListController.getManyByUser);
router.get("/verificar/criacao", CheckListController.verifyChecklistCreation);
router.get("/verificar/itens", CheckListController.verifyChecklistItems);
router.get("/verificar/emails", CheckListController.sendChecklistEmails);
router.put("/:id_checklist", CheckListController.update);
router.delete("/:id_checklist", CheckListController.delete);

module.exports = router;