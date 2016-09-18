var gulp = require('gulp');
gulp.task('json', function () {
    return gulp.src(['app/json/**/*'])
    .pipe(gulp.dest('dist/json'));
});
