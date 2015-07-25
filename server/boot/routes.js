var VideoController = require('../controllers/video-controller.js');
var bodyParser = require('body-parser')


module.exports = function(app) {
    app.use(bodyParser.json()); // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
        extended: true
    }));
    app.post('/links', function(req, res, next) {
        // console.log(req);
        // var links = req
        VideoController.addVideos(req.body, next);
    });
    app.get('/audio', function(req, res, next){
        VideoController.getAudio(req, res, next);
    });
};
