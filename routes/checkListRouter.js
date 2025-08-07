//checklistRouter
var express = require("express");
var router = express.Router();
const CheckListController = require('../controllers/CheckListController');

router.post("/", CheckListController.create);
router.get("/", CheckListController.getMany);
router.get("/:id_checklist", CheckListController.getById);
router.get('/:codpessoa/by_usuario', CheckListController.getManyByUser);
router.put("/:id_checklist", CheckListController.update);
router.delete("/:id_checklist", CheckListController.delete);

module.exports = router;