var express = require('express');
var router = express.Router();
const UserController = require('../controllers/userController');

router.post('/login', UserController.logIn)

module.exports = router;
