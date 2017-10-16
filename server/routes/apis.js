const express = require('express');
var app = express();
const router = express.Router();


const security =   require('./apis/security.api');

router.use('/s', security);

const crawler =   require('./apis/crawler.api');

router.use('/cr', crawler);


module.exports = router;