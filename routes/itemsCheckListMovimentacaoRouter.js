const express = require("express");
const router = express.Router();
const ItemsCheckListMovimentacaoController = require("../controllers/ItemsCheckListMovimentacaoController");

router.post("/", ItemsCheckListMovimentacaoController.create);
router.get("/", ItemsCheckListMovimentacaoController.getMany);
router.get("/:id_item_checklist_movimentacao", ItemsCheckListMovimentacaoController.getById);
router.put("/:id_item_checklist_movimentacao", ItemsCheckListMovimentacaoController.update);
router.delete("/:id_item_checklist_movimentacao", ItemsCheckListMovimentacaoController.delete);

module.exports = router;
