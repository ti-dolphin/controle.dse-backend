//checklistRouter
var express = require("express");
var router = express.Router();
const CheckListController = require('../controllers/CheckListController');

// POST routes
router.post("/", CheckListController.create);

// GET routes - specific paths first
router.get("/", CheckListController.getMany);
router.get("/verificar/criacao", CheckListController.verifyChecklistCreation);
router.get("/verificar/itens", CheckListController.verifyChecklistItems);
router.get("/verificar/emails", CheckListController.sendChecklistEmails);
router.get('/:codpessoa/by_usuario', CheckListController.getManyByUser);
router.get("/:id_checklist", CheckListController.getById);

// PUT routes - specific paths with suffix BEFORE generic paths
router.put("/:id_checklist_movimentacao/approve", CheckListController.approve);
router.put("/:id_checklist", CheckListController.update);

// DELETE routes
router.delete("/:id_checklist", CheckListController.delete);

module.exports = router;