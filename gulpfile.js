var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var gutil = require("gulp-util");
var defaultPaths = [
  'src/TimelineConfig.js',
  'src/Bezier.js',
  'src/Marker.js',
  'src/Timer.js',
  'src/Keyframe.js',
  'src/Layer.js',
  'src/LayerAudio.js',
  'src/LayerImage.js',
  'src/LayerShape.js',
  'src/LayerText.js',
  'src/LayerVideo.js',
  'src/Timeline.js',
  'src/Composition.js'
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
      presets: ["es2015"],
      plugins: ["glslify"]
    }))
    .pipe(concat(distPath))
    .pipe(minify ? uglify() : gutil.noop())
    .pipe(gulp.dest(''));
}

gulp.task('default', function() {
  var minify = true;
  var paths = defaultPaths.concat(domPaths).concat(threePaths);
  var i, total = paths.length - 1,
    split, name;
  for (i = 0; i < total; ++i) {
    split = paths[i].split('/');
    split.shift();
    name = split.join('/');
    compile(paths[i], name, minify);
  }
  i = total;
  split = paths[i].split('/');
  split.shift();
  name = split.join('/');
  return compile(paths[i], name, minify);
});