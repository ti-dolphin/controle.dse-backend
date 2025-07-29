const express = require("express");
const router = express.Router();
const ClientController = require("../controllers/ClientController");

router.get("/", ClientController.getMany);
router.get("/:CODCLIENTE", ClientController.getById);
router.post("/", ClientController.create);
router.put("/:CODCLIENTE", ClientController.update);
router.delete("/:CODCLIENTE", ClientController.delete);

module.exports = router;
