var gulp = require('gulp');
var $    = require('gulp-load-plugins')();

gulp.task('cleanDist', require('del').bind(null, ['dist']));

gulp.task('build', ['cleanDist', 'buildJS', 'styles', 'distJS', 'distCSS', 'html', 'json', 'audio', 'images'], function () {
    global.build = true;
    return gulp.src('dist/**/*')
        .pipe($.size({
            title: 'build',
            gzip: true
        }))
        .pipe( gulp.dest('dist') );
});

gulp.task('images', function () {
    return gulp.src(['app/images/**/*'])
    .pipe(gulp.dest('dist/images'));
});


gulp.task('distJS', function () {
    return gulp.src(['app/scripts/main.min.js'])
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('distCSS', function () {
    return gulp.src(['app/styles/main.css'])
    .pipe($.rubySass({ style: 'compressed' }))
    .pipe(gulp.dest('dist/styles'));
});
