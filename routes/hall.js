const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.render('hall', { title: 'Express' });
});

module.exports = router;