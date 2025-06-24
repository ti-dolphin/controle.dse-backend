var express = require("express");
var router = express.Router();
const MovementationController = require('../controllers/MovementationController');

router.post("/", MovementationController.create);
router.get("/", MovementationController.getMany);
router.get("/:id_movimentacao", MovementationController.getById);
router.put("/:id_movimentacao", MovementationController.update);
router.delete("/:id_movimentacao", MovementationController.delete);



module.exports = router;