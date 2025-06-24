const express = require("express");
const router = express.Router();
const RequisitionKanbanController = require("../controllers/RequisitionKanbanController");

router.post("/", RequisitionKanbanController.create);
router.get("/", RequisitionKanbanController.getMany);
router.get("/:id_kanban_requisicao", RequisitionKanbanController.getById);
router.put("/:id_kanban_requisicao", RequisitionKanbanController.update);
router.delete("/:id_kanban_requisicao", RequisitionKanbanController.delete);

module.exports = router;
