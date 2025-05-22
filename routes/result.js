const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.render('result', { title: 'Express' });
});

module.exports = router;
