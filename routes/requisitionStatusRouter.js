const express = require("express");
const router = express.Router();
const RequisitionStatusController = require("../controllers/RequisitionStatusController");

router.post("/", RequisitionStatusController.create);
router.get("/", RequisitionStatusController.getMany);
router.get(
  "/permissao_status",
  RequisitionStatusController.getStatusPermission
);
router.get("/alteracao", RequisitionStatusController.getStatusAlteration);
router.get("/:id_status_requisicao", RequisitionStatusController.getById);
router.put("/:id_status_requisicao", RequisitionStatusController.update);
router.delete("/:id_status_requisicao", RequisitionStatusController.delete);


module.exports = router;
