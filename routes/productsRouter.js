const express = require("express");
const router = express.Router();
const ProductsController = require("../controllers/ProductsController");

router.get("/", ProductsController.getMany);
router.get("/:id", ProductsController.getById);
router.post("/", ProductsController.create);
router.put("/:id", ProductsController.update);
router.delete("/:id", ProductsController.delete);

module.exports = router;
