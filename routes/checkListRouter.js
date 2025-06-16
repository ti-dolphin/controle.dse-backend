var express = require("express");
var router = express.Router();
// var CheckListController = require('../controllers/CheckListController');
const multerConfig = require("../multer");
const multer = require("multer");
const upload = multer({ storage: multerConfig });

router.get("/notifications", (req, res ) => { 
    // CheckListController.getChecklistNotifications(req, res);
    res.status(501).send('Not Implemented');
});

router.get('/notRealized', (req, res) => {
  // CheckListController.getNonRealizedChecklistByPatrimonyId(req, res);
  res.status(501).send('Not Implemented');
});

router.get('/finish', (req, res) => {
  console.log('FINISH')
  // CheckListController.finishChecklistByPatrimonyId(req, res);
  res.status(501).send('Not Implemented');
});

router.get('/checklistItems/:id_patrimonio/:id_movimentacao/:id_checklist_movimentacao', (req, res) => {
    // CheckListController.getChecklistItems(req, res);
    res.status(501).send('Not Implemented');
});

router.post('', (req, res) => { 
    // CheckListController.updatetChecklist(req, res);
    res.status(501).send('Not Implemented');
});

router.put('/checklistItems',  (req, res) => {
    // CheckListController.updateChecklistItems(req, res);
    res.status(501).send('Not Implemented');
});

router.put(
  "/checklistItems/file/:id_item_checklist_movimentacao",
  upload.single("file"),
  (req, res) => {
    // CheckListController.updateChecklistItemFile(req, res);
    res.status(501).send('Not Implemented');
  }
);

router.post(
  "/checklistItems/file",
  upload.single("file"),
  (req, res) => {
    // CheckListController.createChecklistItemFile(req, res);
    res.status(501).send('Not Implemented');
  }
);

router.get("/:id_patrimonio", (req, res) => {
  // CheckListController.getChecklistByPatrimonyId(req, res);
  res.status(501).send('Not Implemented');
});

module.exports = router;