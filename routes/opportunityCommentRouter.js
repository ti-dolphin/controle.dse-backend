//opportunityCommentRouter

const express = require("express");
const router = express.Router();
const OpportunityCommentController = require("../controllers/OpportunityCommentController");

// Get all opportunity comments
router.get("/", OpportunityCommentController.getMany);

// Get an opportunity comment by ID
router.get("/:CODCOMENTARIO", OpportunityCommentController.getById);

// Create a new opportunity comment
router.post("/", OpportunityCommentController.create);

// Update an opportunity comment by ID
router.put("/:CODCOMENTARIO", OpportunityCommentController.update);

// Delete an opportunity comment by ID
router.delete("/:CODCOMENTARIO", OpportunityCommentController.delete);

module.exports = router;