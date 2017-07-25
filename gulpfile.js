var gulp    = require('gulp');
var babel   = require('gulp-babel');
var concat  = require("gulp-concat");
var uglify  = require("gulp-uglify");
var gutil   = require("gulp-util");
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

function compile(srcPaths, distPath, minify) {
    return gulp.src(srcPaths)
        .pipe(babel({
            comments: false,
            presets: ["latest", "stage-1"],
            plugins: ["transform-class-properties", "glslify"]
        }))
        .pipe(concat(distPath))
        .pipe(minify ? uglify() : gutil.noop())
        .pipe(gulp.dest('dist'));
}

gulp.task('all', ['default', 'individualFiles', 'deluxe', 'dom', 'three'], function() {});

gulp.task('default', function() {
    var minify = true;
    var paths = defaultPaths;
    return compile(paths, 'timeline.min.js', minify);
});

gulp.task('individualFiles', function() {
    var minify = false;
    var paths = defaultPaths.concat(domPaths).concat(threePaths);
    var i, total = paths.length-1, split, name;
    for(i = 0; i < total; ++i) {
        split = paths[i].split('/');
        name = split[split.length-1];
        compile(paths[i], name, minify);
    }
    i = total;
    split = paths[i].split('/');
    name = split[split.length-1];
    return compile(paths[i], name, minify);
});

gulp.task('deluxe', function() {
    var minify = true;
    var paths = defaultPaths.concat(domPaths).concat(threePaths);
    return compile(paths, 'timeline.all.min.js', minify);
});

gulp.task('dom', function() {
    var minify = true;
    var paths = defaultPaths.concat(domPaths);
    return compile(paths, 'timeline.dom.min.js', minify);
});

gulp.task('three', function() {
    var minify = true;
    var paths = defaultPaths.concat(threePaths);
    return compile(paths, 'timeline.three.min.js', minify);
});
