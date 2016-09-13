var gulp = require('gulp');

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));
