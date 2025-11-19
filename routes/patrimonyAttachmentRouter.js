const express = require("express");
const router = express.Router();
const PatrimonyAttachmentController = require("../controllers/PatrimonyAttachmentController");

router.get("/patrimonio/:id_patrimonio", PatrimonyAttachmentController.getMany);
router.get("/:id_anexo_patrimonio", PatrimonyAttachmentController.getById);
router.post("/", PatrimonyAttachmentController.create);
router.delete("/:id_anexo_patrimonio", PatrimonyAttachmentController.delete);

module.exports = router;
