const express = require("express");
const ProductAttachmentController = require("../controllers/ProductAttachmentController");
const router = express.Router();

// Get all product attachments
router.get("/", ProductAttachmentController.getAll);

// Get a specific product attachment by ID
router.get("/:id", ProductAttachmentController.getById);

// Create a new product attachment
router.post("/", ProductAttachmentController.create);

// Update a product attachment
router.put("/:id", ProductAttachmentController.update);

// Delete a product attachment
router.delete("/:id", ProductAttachmentController.delete);

module.exports = router;
