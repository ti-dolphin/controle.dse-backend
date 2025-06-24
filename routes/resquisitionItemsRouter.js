var express = require("express");
var router = express.Router();
 const RequisitionItemController = require("../controllers/RequisitionItemController");

router.get("/", RequisitionItemController.getMany);
router.get("/:id_item_requisicao", RequisitionItemController.getById);
router.post("/", RequisitionItemController.create);
router.put("/:id_item_requisicao", RequisitionItemController.update);
router.delete("/:id_item_requisicao", RequisitionItemController.delete);

module.exports = router;
