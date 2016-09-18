var gulp        = require('gulp');
var concat      = require('gulp-concat');
var browserify  = require("browserify");
var babelify    = require("babelify");
var watchify    = require("watchify");
var glslify     = require("glslify");
var uglify      = require("gulp-uglify");
var gutil       = require("gulp-util");
var buffer      = require("vinyl-buffer");
var source      = require("vinyl-source-stream");
var notify      = require('gulp-notify');
var browserSync = require('browser-sync');

gulp.task('buildJS', function() {
    const input  = "app/scripts/index.js";
    const output = "scripts/main.min.js";
    var bundler  = browserify({
        debug: true,
        fullPaths: false,
        cache: {},
        packageCache: {},
        entries: [ input ]
    });
    bundler.transform( babelify.configure({ optional: ["es7.classProperties"] }) );
    bundler.transform( glslify );
    const bundle = () => {
        return bundler
            .bundle()
            .on('error', function(error) {
                const args = Array.prototype.slice.call(arguments);
                notify.onError({
                    title:   "Compile Error",
                    message: error.message
                }).apply(this, args);
                
                // Proceed
                this.emit('end');
            })
            .pipe( source(output) )
            .pipe( buffer() )
            .pipe( gutil.noop() )
            .pipe( gulp.dest("app") )
            .on('end', function() {
                browserSync.reload();
            });
    };
    bundler = watchify(bundler);
    bundler.on('update', () =>{
        console.log(" > Compiling Scripts...");
        bundle();
    });
    return bundle();
});
