var RealTimeController = {
    lastCall: new Date().getTime()
};

RealTimeController.init = function(io) {
    var rtc = this;


    io.on('connection', function(socket) {
        rtc.socket = socket;
        console.log('New connection!');

        socket.emit('hello');

        if (rtc.links.length) {
            console.log(rtc.links);
            socket.emit('currentLinks', rtc.links);

        }

    });

};

RealTimeController.links = [];

RealTimeController.emit = function(event, info) {
    // console.log(event , info );
    // console.log(this.socket);
    // if (event !== 'convertSuccess' || info.percent != 100) {
    //     if (new Date().getTime() - this.lastCall > 500) {
    this.socket.emit(event, info);
    this.lastCall = new Date().getTime();
    //     }
    // }

};


module.exports = RealTimeController;
