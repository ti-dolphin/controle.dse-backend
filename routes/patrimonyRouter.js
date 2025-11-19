const express = require("express");
const router = express.Router();
const PatrimonyController = require('../controllers/PatrimonyController');


router.get("/", PatrimonyController.getMany)
router.get("/:id_patrimonio", PatrimonyController.getById)
router.get("/tipos/getAll", PatrimonyController.getTypes);
router.put("/:id_patrimonio", PatrimonyController.update)
router.post("/", PatrimonyController.create)
router.delete("/:id_patrimonio", PatrimonyController.delete);

module.exports = router;
