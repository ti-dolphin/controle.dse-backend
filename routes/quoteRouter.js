
var express = require("express");
var router = express.Router();
// const QuoteController = require('../controllers/QuoteController');

router.get('/', (req, res) => { 
    // QuoteController.getQuotes(req, res);
    res.status(501).send('Not Implemented');
});

router.get('/quoteList/:requisitionId', (req,res)=> { 
    // QuoteController.getQuotesByRequisitionId(req, res);
    res.status(501).send('Not Implemented');
});

router.get('/classification', (req, res) => {
    console.log('CLASSIFICATIONS')
    // QuoteController.getFiscalClassifications(req, res);
    res.status(501).send('Not Implemented');
});

router.get('/shipment-type', (req, res)=> {
    // QuoteController.getShipmentTypes(req, res)
    res.status(501).send('Not Implemented');
})

router.get('/:quoteId', (req, res) =>  {
    console.log('getQuote')
    // QuoteController.getQuoteById(req, res);
    res.status(501).send('Not Implemented');
});

router.post('/', (req, res) => {
    console.log('POST')
    // QuoteController.create(req, res);
    res.status(501).send('Not Implemented');
});

router.put('/:quoteId', (req, res) => { 
    // QuoteController.update(req, res);
    res.status(501).send('Not Implemented');
});
router.put('/:quoteId/items', (req, res) => { 
    // QuoteController.updateItems(req, res);
    res.status(501).send('Not Implemented');
});


module.exports = router;
