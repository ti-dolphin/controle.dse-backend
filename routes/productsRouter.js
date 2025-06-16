const express = require("express");
const router = express.Router();
// const ProductsController = require("../controllers/productsController");

router.get('/',  (req, res) => { 
    // ProductsController.getProductsBySearch(req, res);
    res.status(501).send('Not Implemented');
});

module.exports = router;
