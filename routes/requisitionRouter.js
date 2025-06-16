var express = require("express");
var router = express.Router();
// const RequisitionController = require("../controllers/requisitionController");

// GET /requisition/
router.get("/", (req, res) => {
  // RequisitionController.getRequisitions(req, res)
  res.status(501).send('Not Implemented');
});

router.get('/types', (req, res) => {
  // RequisitionController.getTypes(req, res)
  res.status(501).send('Not Implemented');
});

router.get("/:id", (req, res) => {
  // RequisitionController.getRequisitionByID(req, res)
  res.status(501).send('Not Implemented');
});

router.post("/", (req, res) => {
  // RequisitionController.insertRequisitions(req, res)
  res.status(501).send('Not Implemented');
});

router.put("/:requisitionID", (req, res) => {
  // RequisitionController.updateRequisitionById(req, res)
  res.status(501).send('Not Implemented');
});

router.delete("/:requisitionID", (req, res) => {
  // RequisitionController.deleteRequisitionById(req, res)
  res.status(501).send('Not Implemented');
});

module.exports = router;
