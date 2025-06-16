const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerConfig = require("../multer");
// const OpportunityController = require('../controllers/OpportunityController');
const upload = multer({ storage: multerConfig });
router.get('/', (req, res) => {
    console.log('GET')
    // OpportunityController.getOpportunities(req, res);
    res.status(501).send('Not Implemented');
});



router.put("/update/:oppId", async (req, res) => {
    console.log("PUT")
    // await OpportunityController.updateOpportunity(req, res);
    res.status(501).send('Not Implemented');
});

router.post('/create', async (req, res) => {
    // await OpportunityController.createOpportunity(req, res);
    res.status(501).send('Not Implemented');
});

router.post('/files', upload.array("files"), (req, res) => {
    // OpportunityController.uploadFiles(req, res);
    res.status(501).send('Not Implemented');
});


router.get("/send-sale-email", async (req, res) => {
    console.log('SEND SALE EMAIL');
    // await OpportunityController.sendSaleEmail(req, res);
    res.status(501).send('Not Implemented');
});

router.get('/files', async (req, res) => {
    console.log('files')
    // await OpportunityController.getOpportunityFiles(req, res);
    res.status(501).send('Not Implemented');
});

router.get('/saler', async (req, res) => {
    // await OpportunityController.getSalers(req, res);
    res.status(501).send('Not Implemented');
})
router.get('/manager', async (req, res) => {
    console.log('MANAGER')
    // await OpportunityController.getManagers(req, res);
    res.status(501).send('Not Implemented');
});

router.get('/status', async (req, res) => {
    // await OpportunityController.getStatusList(req, res);
    res.status(501).send('Not Implemented');
});

router.get('/client', async (req, res) => {
    // await OpportunityController.getClients(req, res);
    res.status(501).send('Not Implemented');
});
router.get('/sales-report', async (req, res) => {
    // await OpportunityController.getOppsByComercialResponsable(req, res);
    res.status(501).send('Not Implemented');
});

router.get('/manager-report', async (req, res) => {
    // await OpportunityController.getOppsByManager(req, res);
    res.status(501).send('Not Implemented');
});

router.get("/:oppId", async (req, res) => {
    console.log('getbyid')
    // await OpportunityController.getOpportunityById(req, res);
    res.status(501).send('Not Implemented');
});



module.exports = router;