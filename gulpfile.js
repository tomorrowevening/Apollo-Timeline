var gulp    = require('gulp');
var babel   = require('gulp-babel');
var concat  = require("gulp-concat");
var uglify  = require("gulp-uglify");
var defaultPaths = [
    'src/timeline/Bezier.js',
    'src/timeline/Marker.js',
    'src/timeline/Timer.js',
    'src/timeline/Keyframe.js',
    'src/timeline/Layer.js',
    'src/timeline/LayerAudio.js',
    'src/timeline/LayerImage.js',
    'src/timeline/LayerShape.js',
    'src/timeline/LayerText.js',
    'src/timeline/LayerVideo.js',
    'src/timeline/Timeline.js',
    'src/timeline/Composition.j'
];
var domPaths = [
    'src/dom/SVGUtil.js',
    'src/dom/SVGItem.js'
];
var threePaths = [
    'src/three/EffectComposer.js',
    'src/three/THREEConfig.js',
    'src/three/THREEFBO.js',
    'src/three/THREELayer.js',
    'src/three/THREEImage.js',
    'src/three/THREEShape.js',
    'src/three/THREEText.js',
    'src/three/THREEVideo.js'
];

function compile(srcPaths, distPath) {
    return gulp.src(srcPaths)
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
    var paths = defaultPaths;
    return compile(paths, 'timeline.min.js');
});

gulp.task('deluxe', function() {
    var paths = defaultPaths.concat(domPaths).concat(threePaths);
    return compile(paths, 'timeline.all.min.js');
});

gulp.task('dom', function() {
    var paths = defaultPaths.concat(domPaths);
    return compile(paths, 'timeline.dom.min.js');
});

gulp.task('three', function() {
    var paths = defaultPaths.concat(threePaths);
    return compile(paths, 'timeline.three.min.js');
});
