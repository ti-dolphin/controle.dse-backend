var express = require("express");
var router = express.Router();
 const RequisitionItemController = require("../controllers/RequisitionItemController");

router.get("/", RequisitionItemController.getMany);
router.get("/:id_item_requisicao", RequisitionItemController.getById);
router.get('/columns/:id_requisicao', RequisitionItemController.getDinamicColumns);
router.post("/", RequisitionItemController.create);
router.post("/many", RequisitionItemController.createMany);
router.put("/:id_item_requisicao", RequisitionItemController.update);
router.put("/ocs/update", RequisitionItemController.updateOCS);
router.put("/shipping_date/update", RequisitionItemController.updateShippingDate);
router.put(
  "/itens_cotacao_selecionados/update",
  RequisitionItemController.updateQuoteItemsSelected
);

router.delete("/:id_item_requisicao", RequisitionItemController.delete);

module.exports = router;
