var gulp    = require('gulp');
var babel   = require('gulp-babel');
var concat  = require("gulp-concat");
var uglify  = require("gulp-uglify");
var defaultPaths = [
    "src/timeline/Bezier.js",
    "src/timeline/Marker.js",
    "src/timeline/Timer.js",
    "src/timeline/Keyframe.js",
    "src/timeline/Layer.js",
    "src/timeline/LayerAudio.js",
    "src/timeline/LayerImage.js",
    "src/timeline/LayerShape.js",
    "src/timeline/LayerText.js",
    "src/timeline/LayerVideo.js",
    "src/timeline/Timeline.js",
    "src/timeline/Composition.js"
];

function compile(paths, distPath) {
    return gulp.src(paths)
        .pipe(babel({
            comments: false,
            presets: ["latest"],
            plugins: ["transform-class-properties", "glslify"]
        }))
        .pipe(concat(distPath))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
}

gulp.task('default', function() {
    return compile(defaultPaths, 'timeline.min.js');
});
