var ffmpeg = require('ffmpeg');
var rtc = require('./real-time-controller.js');
var path = require('path');
var fs = require('fs');

var ConverterController = {
    // lastCall: new Date().getTime()
};

ConverterController.videos = [];

ConverterController.convertVideo = function(data, callback) {
    try {
        var process = new ffmpeg(data.output);
        process.then(function(video) {
            rtc.emit('convertStarted', video.metadata);
            video.fnExtractSoundToMP3(
                path.join(__dirname, '../audio/' + data.filename),
                function(error, file) {
                    callback(error, file);
                }
            );
        }, function(err) {
            callback(err, {});
        });
    } catch (e) {
        callback(e, {});
    }
}




module.exports = ConverterController;
