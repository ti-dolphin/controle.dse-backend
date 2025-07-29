var express = require('express');
var router = express.Router();
const UserController = require('../controllers/UserController');

router.get('/', UserController.getMany)

router.get('/:CODPESSOA', UserController.getById)

//pessoa_comercial
router.get('/comercial/pessoa_comercial', UserController.getComercialUsers)

router.post("/login",  UserController.login);

router.post("/register", UserController.register);

router.put("/:CODPESSOA", UserController.update);

router.delete("/:CODPESSOA", UserController.delete);



module.exports = router;
