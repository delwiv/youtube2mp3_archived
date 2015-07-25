var fs = require('fs');
var ytdl = require('youtube-dl');
var _ = require('lodash');
var rtc = require('./real-time-controller.js');
var path = require('path');
var converter = require('./converter-controller.js');


var VideoController = {
    downloadList: [],
    downloading: false
};

VideoController.getAudio = function(req, res, next) {
    fs.readdir(path.join(__dirname, '../audio/'), function(error, files){
        if (error) return next(error);
        res.json(files);
    });
}

VideoController.addVideos = function(params, callback) {
    var self = this;
    _.forEach(params.links, function(link) {
        self.updateDownloadList(link); //index of just added video
    }, {});
};

VideoController.updateDownloadList = function(link) {
    var self = this;
    // video.index = index;
    var download = {
        status: 'pending',
        link: link,
        video: {},
        index: self.downloadList.length // actual size = index of next item ;)
    };
    self.downloadList.push(download);

    rtc.emit('dlAdded', download);

    if (!self.dowloading) {
        self.dowloading = true;
        self.launchDownload(download);
    }
};

//recursive ++index
VideoController.launchDownload = function(download) {
    var self = this;

    if (!download) {
        self.downloading = false;
        return;
    }
    try {

        var video = ytdl(download.link, ['--force-ipv4', '--format=18'], {});


        video.custom = {};
        video.custom.size = 0;
        video.custom.index = download.index;

        video.on('info', function(info) {
            // console.log('Download started');
            // console.log('filename: ' + info._filename);
            // console.log('size: ' + info.size);
            var filename = info._filename.replace(/(\ |\(|\)|\"|\'|\.|\/")/g, '');
            video.custom.output = path.join(__dirname, '../downloading/' + filename);
            video.custom.filename = filename;
            video.custom.pos = 0;
            video.custom.size = info.size;

            video.pipe(fs.createWriteStream(video.custom.output));

            download.video = video;
            download.status = 'downloading';

            rtc.emit('dlStarted', video.custom);
        });

        video.on('data', function(data) {
            video.custom.pos += data.length;
            // `size` should not be 0 here.
            if (video.custom.size) {
                video.custom.percent = (video.custom.pos / video.custom.size * 100).toFixed(2);
                // process.stdout.cursorTo(0);
                // process.stdout.clearLine(1);
                // process.stdout.write(video.custom.percent + '%');
                // console.log(data);

                rtc.emit('dlProgress', video.custom);
            }
        });

        video.on('end', function() {
            // console.log('DL finished');
            video.custom.status = 'converting';
            video.custom.percent = 100;
            rtc.emit('dlProgress', video.custom);
            self.convert(video.custom);
            self.launchDownload(self.downloadList[video.custom.index + 1]);
        });
    } catch (error) {
        rtc.emit('dlError', err);
    }
};

VideoController.convert = function(data) {
    console.log('launching conversion...');

    converter.convertVideo(data, function(error, file) {
        if (error) {
            console.log(error);
            rtc.emit('convertError', error);
        } else {
            console.log(file);
            var filename = file.replace(/^.*[\\\/]/, '');
            var audio = {
                filename: filename
            }
            rtc.links.push(audio);
            rtc.emit('convertSuccess', audio);
        }
        console.log('Deleting file ' + data.output);
        fs.unlink(data.output);
    });

};

module.exports = VideoController;
