'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    cssmin = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    ngAnnotate = require('gulp-ng-annotate'),
    miniHtml = require('gulp-minify-html'),
    ngHtml = require('gulp-ng-html2js'),
    livereload = require('gulp-livereload'),
    sm = require('gulp-sourcemaps'),
    streamqueue = require('streamqueue'),
    debug = require('gulp-debug');


// on recupere les assets
var assets = require('./client/assets.json');

var build_path = __dirname + '/build';
var build_assets_path = build_path + '/assets';

function error(err) {
    console.log(err.message.trim());
}

var child_process = require('child_process');

function Server(config) {
    this.service = null;
    this.config = config;

    this.start = function(fn) {
        var self = this;
        if (this.service) {
            this.service.kill('SIGKILL');
            this.service = null;
        }

        this.service = child_process.spawn('node', [this.config.app], process.env);

        this.service.stdout.setEncoding('utf8');
        this.service.stderr.setEncoding('utf8');
        this.service.stdout.on('data', function(data) {
            console.log(data.trim());
            if (fn)
                fn(data.trim());
        });
        this.service.stderr.on('data', function(data) {
            console.log(data.trim());
        });
        process.on('exit', function() {
            self.service.kill();
        });
    };
}

function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}


var node_server = new Server({
    app: 'server/server.js'
});
/*
var www_server = new Server({
    app: 'gulp-server.js'
});
*/
gulp.task('start-server', function(cb) {
    node_server.start(function(data) {
        if (/^mongodb connection:.*/.test(data)) {
            cb();
        }
    });
});

//gulp.task('start-www', function(cb) {
//    www_server.start(function(data) {
//        if (/^gulp-server.*/.test(data)) {
//            cb();
//        }
//    });
//});

// vendors
gulp.task('vendors-js', function() {
    return streamqueue({
                objectMode: true
            },
            gulp.src(assets.vendors.js.min),
            gulp.src(assets.vendors.js.src)
            .pipe(debug({
                title: 'unicorn:'
            }))
            .pipe(ngAnnotate())
            .pipe(uglify())
        )
        .pipe(concat('vendors.min.js'))
        .pipe(gulp.dest('client/assets/js'));
});


gulp.task('vendors-css', function() {
    return gulp.src(assets.vendors.css.src)
        .pipe(cssmin())
        .pipe(concat('vendors.min.css'))
        .pipe(gulp.dest('client/assets/css'));
});

//app
gulp.task('app-js', function() {
    return gulp.src('client/app/**/*.js')
        .pipe(debug({
            title: 'unicorn:'
        }))
        .pipe(sm.init())
        .pipe(concat('app.src.js'))
        .pipe(sm.write('./'))
        .pipe(gulp.dest('client/assets/js'));
});

gulp.task('app-sass', function() {
    return gulp.src(["client/app/**/*.scss"])
        .pipe(debug({
            title: 'unicorn:'
        }))
        .pipe(sass())
        .on('error', error)
        .pipe(concat('app.src.css'))
        .pipe(gulp.dest('./client/assets/css'));
});

gulp.task('dev', [
    'vendors-js',
    'vendors-css',
    'app-js',
    'app-sass'
]);

gulp.task('default', ['dev'], function() {
    livereload.listen();

    gulp.start('start-server');

    gulp.watch([
        './server/**/*.js',
        './server/**/*.json',
        './common/**/*.*'
    ], ['start-server']);

    gulp.watch('./client/app/**/*.js', ['app-js']);
    gulp.watch('./client/app/**/*.scss', ['app-sass']);

    gulp.watch('./client/assets.json', ['vendors-js', 'vendors-css'])
        .on('change', function() {
            assets = requireUncached('./client/assets.json');
            console.log('reload assets.json');
        });

    gulp.watch([
        'client/app/**/*.html',
        'client/assets/**/*.css',
        'client/assets/js/*.js'
    ], livereload.changed);
});
