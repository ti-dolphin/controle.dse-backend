const express = require("express");
const router = express.Router();
const ProductsController = require("../controllers/productsController.js");

router.get("/", ProductsController.getMany);
router.get("/:id", ProductsController.getById);
router.post("/", ProductsController.create);
router.put("/:id", ProductsController.update);
router.delete("/:id", ProductsController.delete);

module.exports = router;
