var express = require("express");
var router = express.Router();
// const PatrimonyController = require('../controllers/PatrimonyController');
const multerConfig = require("../multer");
const multer = require("multer");
const upload = multer({ storage: multerConfig });

router.get('', (req, res, next ) => { 
    // PatrimonyController.getPatrimonyInfo(req, res);
    res.status(501).send('Not Implemented');
});

router.get('/types', (req, res, next) => { 
    // PatrimonyController.getPatrimonyType(req, res);
    res.status(501).send('Not Implemented');
});
router.get('/inactive', (req, res, next) => { 
    // PatrimonyController.getInactivePatrymonyInfo(req, res)
    res.status(501).send('Not Implemented');
});

router.get('/:patrimonyId', (req, res, next) => { 
    // PatrimonyController.getSinglePatrimonyInfo(req, res);
    res.status(501).send('Not Implemented');
});

router.get("/files/:patrimonyId", (req, res, next) => {
  // PatrimonyController.getPatrimonyFiles(req, res);
  res.status(501).send('Not Implemented');
});

router.get("/responsable/:patrimonyId", (req, res, next) => {
  // PatrimonyController.getPatrimonyResponsable(req, res);
  res.status(501).send('Not Implemented');
});


router.put("/:patrimonyId",  (req, res, next) => {
  // PatrimonyController.updatePatrimony(req, res);
  res.status(501).send('Not Implemented');
});


router.put('/', (req, res, next) => { 
    // PatrimonyController.updatePatrimonies(req, res);
    res.status(501).send('Not Implemented');
});


router.post('', (req, res, next) => {  
    // PatrimonyController.createPatrimony(req, res);
    res.status(501).send('Not Implemented');
});

router.post("/files/:patrimonyId", upload.single("file"), (req, res, next) => {
  // PatrimonyController.createPatrimonyFile(req, res);
  res.status(501).send('Not Implemented');
});

router.delete("/files/:filename/:patrimonyFileId", (req, res, next) => {
  // PatrimonyController.deletePatrimonyFile(req, res);
  res.status(501).send('Not Implemented');
});

router.delete("/:patrimonyId", (req, res, next) => {
  // PatrimonyController.deletePatrimony(req, res);
  res.status(501).send('Not Implemented');
});

module.exports = router;
