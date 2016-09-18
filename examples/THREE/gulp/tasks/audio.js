var gulp   = require('gulp');

gulp.task('audio', function () {
  return gulp.src('app/audio/**/*')
    .pipe( gulp.dest('dist/audio') );
});
