const express = require("express");
const router = express.Router();

const PatrimonyFileController = require("../controllers/PatrimonyFileController");

router.get("/", PatrimonyFileController.getMany);

router.get("/:id_anexo_patrimonio", PatrimonyFileController.getById);

router.post("/", PatrimonyFileController.create);

router.put("/:id_anexo_patrimonio", PatrimonyFileController.update);

router.delete("/:id_anexo_patrimonio", PatrimonyFileController.delete);

module.exports = router;