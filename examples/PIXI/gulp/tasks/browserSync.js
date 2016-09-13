var gulp = require('gulp');
var browserSync = require('browser-sync');

gulp.task('browserSync', function() {
    return browserSync.init({
        notify: false,
        port:   3000,
        server: ['.tmp', 'app'],
        https: false
    });
});