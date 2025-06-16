const express = require("express");
// const PatrimonyAccessoryController = require("../controllers/patrimonyAccessoryController");
const multerConfig = require("../multer");
const multer = require("multer");
const upload = multer({ storage: multerConfig });
const router = express.Router();

router.post("/", (req, res) => {
  // PatrimonyAccessoryController.createAccessory(req, res)
  res.status(501).send('Not Implemented');
});
router.get("/:id", (req, res) => {
  // PatrimonyAccessoryController.getAccessoryById(req, res)
  res.status(501).send('Not Implemented');
});
router.put("/:id", (req, res) => {
  // PatrimonyAccessoryController.updateAccessory(req, res)
  res.status(501).send('Not Implemented');
});
router.delete("/:id", (req, res) => {
  // PatrimonyAccessoryController.deleteAccessory(req, res)
  res.status(501).send('Not Implemented');
});
router.get(
  "/patrimony-accessory/:id_patrimonio",
  (req, res) => {
    // PatrimonyAccessoryController.getAccessoriesByPatrimonyId(req, res)
    res.status(501).send('Not Implemented');
  }
);
router.get(
  "/files/:accessoryId",
  (req, res) => {
    // PatrimonyAccessoryController.getFilesByAccessoryId(req, res)
    res.status(501).send('Not Implemented');
  }
);
router.delete(
  "/files/:filename/:id_anexo_acessorio_patrimonio",
  (req, res) => {
    // PatrimonyAccessoryController.deletPatrimonyAccessoryFile(req, res)
    res.status(501).send('Not Implemented');
  }
);

router.post(
  "/files/:id_acessorio_patrimonio", upload.single("file"), (req, res) => {
    // PatrimonyAccessoryController.createPatrimonyAccessoryFile(req, res)
    res.status(501).send('Not Implemented');
  }
);


module.exports = router;
