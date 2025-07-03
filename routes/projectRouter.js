var express = require("express");
const ProjectController = require("../controllers/ProjectController");
var router = express.Router();
// const ProjectController = require("../controllers/projectController");
router.get("/", ProjectController.getMany);

router.get("/:ID", ProjectController.getById);

router.post("/", ProjectController.create);

router.put("/:ID", ProjectController.update);

router.delete("/:ID", ProjectController.delete);

module.exports = router;
