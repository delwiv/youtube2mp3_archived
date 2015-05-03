var loopback = require('loopback');
var path = require('path');

module.exports = function(app) {
    // Install a `/` route that returns server status
    app.use(loopback.static(path.resolve(__dirname, '../../client')));
    app.use('/audio', loopback.static(__dirname + '/../audio'));
    app.use('/assets', loopback.static(__dirname + '../../client/assets'));

};
