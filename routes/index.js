var express = require('express');
var router = express.Router();

var sessionController=require('../controllers/session_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/login', sessionController.new);
router.post('/login', sessionController.create);
router.get('/logout',sessionController.destroy);


module.exports = router;
