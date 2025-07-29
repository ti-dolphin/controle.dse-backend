var express = require("express");
var router = express.Router();
 const RequisitionController = require("../controllers/requisitionController.js");


router.get("/", RequisitionController.getMany);
router.get("/:id_requisicao", RequisitionController.getById);
router.post("/", RequisitionController.create);
router.put("/:id_requisicao", RequisitionController.update);
router.delete("/:id_requisicao", RequisitionController.delete);
module.exports = router;
