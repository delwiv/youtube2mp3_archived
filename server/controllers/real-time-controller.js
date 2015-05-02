var engine = require('engine.io');

var RealTimeController = {};

RealTimeController.init = function(app) {
    var rtc = this;
    this.socket = {};

    var server = engine.attach(app);

    server.on('connection', function(socket) {
        rtc.socket = socket;
        console.log('New connection!');
        socket.on('ping', function(data) {
            console.log('pig catched ! ponging back... ' + data);
            socket.send('pong');
        });
    });
};

RealTimeController.emit = function(event, info) {
    console.log(event, info);
    // console.log(this.socket);
    this.socket.send(event, info);
};

module.exports = RealTimeController;
