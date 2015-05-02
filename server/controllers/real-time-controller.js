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
            socket.emit('currentLinks', rtc.links)

        }

    });

};

RealTimeController.links = [];

RealTimeController.emit = function(event, info) {
    console.log(event/*, info*/);
    // console.log(this.socket);
    if (new Date().getTime() - this.lastCall > 2000) {
        this.socket.emit(event, info);
        this.lastCall = new Date().getTime();
    }

};


module.exports = RealTimeController;
