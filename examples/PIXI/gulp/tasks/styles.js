var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('styles', function () {
    return gulp.src('app/styles/main.scss')
    .pipe($.rubySass({
      style: 'expanded'
    }))
    .pipe(gulp.dest('app/styles'));
});
