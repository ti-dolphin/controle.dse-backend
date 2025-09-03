const express = require("express");
const ProductAttachmentController = require("../controllers/ProductAttachmentController");
const router = express.Router();


router.get("/:id_produto", ProductAttachmentController.getByProduct);

router.post("/", ProductAttachmentController.create);

router.delete("/:id_anexo_produto", ProductAttachmentController.delete);

module.exports = router;
