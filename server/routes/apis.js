const express = require('express');
var app = express();
const router = express.Router();


const security =   require('./apis/security.api');

router.use('/s', security);


module.exports = router;