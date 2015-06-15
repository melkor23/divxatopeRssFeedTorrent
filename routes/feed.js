exports.rssfeed = function(req, res){
  res.render('feed', { title: 'Melkor Rss Feed' });
};

exports.rssfeedAll = function(req, res){
  res.render('feedAll', { title: 'Melkor Rss Feed' });
};



var sessionController=require('../controllers/session_controller');

