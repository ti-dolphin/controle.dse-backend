const express = require("express");
const router = express.Router();
const ChecklistMovementationItemController = require("../controllers/ChecklistMovementationItemController");

router.post("/", ChecklistMovementationItemController.create);
router.get("/", ChecklistMovementationItemController.getMany);
router.get("/:id_item_checklist_movimentacao", ChecklistMovementationItemController.getById);
router.put("/:id_item_checklist_movimentacao", ChecklistMovementationItemController.update);
router.delete("/:id_item_checklist_movimentacao", ChecklistMovementationItemController.delete);

module.exports = router;
