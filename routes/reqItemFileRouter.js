var express = require("express");
var router = express.Router();
const ReqItemFileController = require("../controllers/ReqItemFileController");

router.get("/", ReqItemFileController.getMany);
router.get("/:id", ReqItemFileController.getById);
router.post("/", ReqItemFileController.create);
router.put("/:id", ReqItemFileController.update);
router.delete("/:id", ReqItemFileController.delete);

module.exports = router;
