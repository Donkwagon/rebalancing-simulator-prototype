const express = require('express');
var app = express();
const router = express.Router();


const security =   require('./apis/security.api');
router.use('/s', security);

const simulation =   require('./apis/simulation.api');
router.use('/simu', simulation);

const portfolio =   require('./apis/portfolio.api');
router.use('/p', portfolio);

const crawler =   require('./apis/crawler.api');
router.use('/cr', crawler);


module.exports = router;