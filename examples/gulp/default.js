var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var uglify = require("gulp-uglify");
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('browserSync', function() {
  return browserSync.init({
    notify: false,
    port: 3000,
    server: ['.tmp', 'app'],
    https: false
  });
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('default', ['clean', 'scripts', 'styles', 'browserSync'], function() {});

gulp.task('dist', ['prebuild', 'build'], function() {});
