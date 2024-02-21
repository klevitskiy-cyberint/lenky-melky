var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Lenky Melky', operations: '`</url?value=<base64_encoded_url>` - performs processing of the requested URL or `binary?value=<base64_encoded_url>` - performs upload of specified file' });
});

module.exports = router;
