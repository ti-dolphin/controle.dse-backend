var express = require("express");
var router = express.Router();
 const RequisitionController = require("../controllers/RequisitionController");


router.get("/", RequisitionController.getMany);
router.get("/:id", RequisitionController.getById);
router.post("/", RequisitionController.create);
router.put("/:id", RequisitionController.update);
router.delete("/:id", RequisitionController.delete);
module.exports = router;
