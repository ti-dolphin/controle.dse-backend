const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerConfig = require("../multer");
const OpportunityController = require('../controllers/OpportunityController');
const upload = multer({ storage: multerConfig });
router.get('/', (req, res) => {
    console.log('GET')
    OpportunityController.getOpportunities(req, res);
});



router.put("/update/:oppId", async (req, res) => {
    console.log("PUT")
    await OpportunityController.updateOpportunity(req, res);
});

router.post('/create', async (req, res) => {
    await OpportunityController.createOpportunity(req, res);
});

router.post('/files', upload.array("files"), (req, res) => {
    OpportunityController.uploadFiles(req, res);
});


router.get("/send-sale-email", async (req, res) => {
    console.log('SEND SALE EMAIL');
    await OpportunityController.sendSaleEmail(req, res);
});

router.get('/files', async (req, res) => {
    console.log('files')
    await OpportunityController.getOpportunityFiles(req, res);
});

router.get('/saler', async (req, res) => {
    await OpportunityController.getSalers(req, res);
})
router.get('/manager', async (req, res) => {
    console.log('MANAGER')
    await OpportunityController.getManagers(req, res);
});

router.get('/status', async (req, res) => {
    await OpportunityController.getStatusList(req, res);
});

router.get('/client', async (req, res) => {
    await OpportunityController.getClients(req, res);
});
router.get('/sales-report', async (req, res) => {
    await OpportunityController.getOppsByComercialResponsable(req, res);
});

router.get('/manager-report', async (req, res) => {
    await OpportunityController.getOppsByManager(req, res);
});

router.get("/:oppId", async (req, res) => {
    console.log('getbyid')
    await OpportunityController.getOpportunityById(req, res);
});



module.exports = router;