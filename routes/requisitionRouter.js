var express = require("express");
var router = express.Router();
 const RequisitionController = require("../controllers/requisitionController.js");


router.get("/", RequisitionController.getMany);
router.get("/:id_requisicao", RequisitionController.getById);
router.post("/", RequisitionController.create);
router.post('/parcial/create', RequisitionController.createFromOther);
router.put("/:id_requisicao", RequisitionController.update);
router.put("/:id_requisicao/cancelar", RequisitionController.cancel);
router.put("/:id_requisicao/ativar", RequisitionController.activate);
router.put("/:id_requisicao/status", RequisitionController.changeStatus);
router.put("/:id_requisicao/status/revert", RequisitionController.revertToPreviousStatus);
router.post("/:id_requisicao/atender", RequisitionController.attend);
router.delete("/:id_requisicao", RequisitionController.delete);
router.get("/faturamentos/tipos", RequisitionController.getAllFaturamentosTypes);
module.exports = router;
