var express = require("express");
var router = express.Router();
const multerConfig = require("../multer");
const multer = require("multer");
// const ItemFileController = require("../controllers/itemFileController");

const upload = multer({ storage: multerConfig });

// POST /item/:itemID
router.post("/:itemID", upload.single("file"), (req, res) => {
  // ItemFileController.createItemFile(req, res);
  res.status(501).send('Not Implemented');
});

// POST /item/link/:itemID
router.post("/link/:itemID", (req, res) => {
  // ItemFileController.createItemFileFromLink(req, res);
  res.status(501).send('Not Implemented');
});

// GET /item/:itemID
router.get("/:itemID", (req, res) => {
  // ItemFileController.getItemFilesByFileId(req, res);
  res.status(501).send('Not Implemented');
});

// DELETE /item/:id
router.delete("/:filename/:id", (req, res) => {
  // ItemFileController.deleteItemFile(req, res);
  res.status(501).send('Not Implemented');
});

module.exports = router;
