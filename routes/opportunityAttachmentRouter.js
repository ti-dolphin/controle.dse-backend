const express = require("express");
const router = express.Router();
const OpportunityAttachmentController = require("../controllers/OpportunityAttachmentController");

// Get all opportunity attachments
router.get("/", OpportunityAttachmentController.getMany);

// Get an opportunity attachment by ID
router.get("/:id_anexo_os", OpportunityAttachmentController.getById);

// Create a new opportunity attachment
router.post("/", OpportunityAttachmentController.create);

// Update an opportunity attachment by ID
router.put("/:id_anexo_os", OpportunityAttachmentController.update);

// Delete an opportunity attachment by ID
router.delete("/:id_anexo_os", OpportunityAttachmentController.delete);

module.exports = router;

