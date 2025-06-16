var express = require("express");
var router = express.Router();
// const RequisitionItemController = require("../controllers/requisitionItemController");

// GET /requisitionItems/:requisitionID
router.get("/:requisitionID",  function (req, res, next) {
   // RequisitionItemController.getRequisitionItemByReqID(req, res);
   res.status(501).send('Not Implemented');
});

// POST /requisitionItems/:requisitionID
router.post("/:requisitionID",  (req, res, next) => {
    // RequisitionItemController.createRequisitionItems(req, res);
  //  next();
  res.status(501).send('Not Implemented');
});

// DELETE /requisitionItems/:requisitionID/:productID
router.delete("/:requisitionID/",  (req, res, next) => {
    // RequisitionItemController.deleteRequisitionItems( req, res );
  //  next();
  res.status(501).send('Not Implemented');
});

// PUT /requisitionItems/:requisitionID
router.put("/:requisitionID",  (req, res, next) => {
    // RequisitionItemController.updateRequisitionItems(req, res);
    res.status(501).send('Not Implemented');
});

module.exports = router;
