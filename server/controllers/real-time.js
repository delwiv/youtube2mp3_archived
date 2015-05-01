// var WebSocketServer = require('ws');
// // var UserController = require('UserController');

// var RealTimeController = function(app, DownloadController) {
//     var wss = new WebSocketServer({
//         server: app
//     });

//     this.ws = {};

//     wss.on('connection', function(websocket) {
//         this.ws = websocket;

//         ws.on('hello', function(data) {
//             // UserController.check

//         });

//         ws.on('parse', function(links) {
//             var response = DownloadController.fetch(links, function(info) {
//                 ws.emit('parseStatus', info);
//             });

//         });
//     });

//     function sendInfo(info) {
//         ws.emit('info', info);
//     }


// };


// module.exports = RealTimeController;
