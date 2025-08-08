// controle.dse-backend/routes/webComentariosRequsicaoRouter.js
const express = require("express");
const router = express.Router();
const RequisitionCommentController = require("../controllers/RequisitionCommentController");

router.get("/", RequisitionCommentController.getMany);
router.get("/:id", RequisitionCommentController.getById);
router.post("/", RequisitionCommentController.create);
router.put("/:id", RequisitionCommentController.update);
router.delete("/:id", RequisitionCommentController.delete);

module.exports = router;
