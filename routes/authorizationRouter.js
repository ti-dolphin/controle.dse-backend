
var express = require("express");
var router = express.Router();
const {authorize, getToken} = require("../middleware/authentication");


router.get("/", (req, res) => {
    res.send("Hello World");
});

router.get("/getSupplierAccess", async (req, res) => {
    const {id_cotacao, id_requisicao} = req.query;
    
    const token = getToken();
    res.send(`requisicoes/${id_requisicao}/cotacao/${id_cotacao}?token=${token}`);
});

module.exports = router;