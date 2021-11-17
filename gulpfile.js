var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass')(require('sass')),    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    postcss = require('gulp-postcss'),
    imageResize = require('gulp-image-resize'),
    parallel = require("concurrent-transform"),
    os = require("os"),
    cp = require('child_process');

var messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
}

/**
 * Build the Jekyll Site
 */
function jekyllbuild (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('bundle', ['exec', 'jekyll', 'build', '--config=_config.yml'], {stdio: 'inherit'})
        .on('close', done);
}

/**
 * Build the dev Jekyll Site
 */
function jekyllbuildgitdocs (done) {
    return cp.spawn('bundle', ['exec', 'jekyll', 'build', '--config=_config.yml,_config-dev.yml'], {stdio: 'inherit'})
        .on('close', done);
}

/**
 * Build the dev Jekyll Site for Jay
 */
 function jekyllbuildjdb (done) {
    return cp.spawn('bundle', ['exec', 'jekyll', 'build', '--config=_config.yml,_config-dev-jdb.yml'], {stdio: 'inherit'})
        .on('close', done);
}

/**
 * Wait for jekyll-build, then launch the Server
 */
function browsersync(cb) {
  browserSync.init({
    server: {
      baseDir: 'docs'
    },
    startPath: "/index.html"
  });
  cb()
}

// var opacity = function(css) {
//   css.eachDecl(function(decl, i) {
//     if (decl.prop === 'opacity') {
//       decl.parent.insertAfter(i, {
//         prop: '-ms-filter',
//         value: '"progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (parseFloat(decl.value) * 100) + ')"'
//       });
//     }
//   });
// };

/**
 * Compile files from sass into both assets/css (for live injecting) and site (for future jekyll builds)
 */
function styles() {
  return gulp.src('_scss/main.scss')
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(autoprefixer())
    //.pipe(postcss([opacity]))
    .pipe(gulp.dest('assets/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('assets/css'));
};

/**
 * Automatically resize post feature images and turn them into thumbnails
 */
function thumbnails () {
  return gulp.src("assets/images/hero/*.{jpg,png}")
    .pipe(parallel(
      imageResize({ width : 350 }),
      os.cpus().length
    ))
    .pipe(gulp.dest("assets/images/thumbnail"));
};

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll
 * Watch docs generation, reload BrowserSync
 */
function watch() {
  gulp.watch('_scss/**/*.scss', styles);
  gulp.watch('assets/images/hero/*.{jpg,png}', thumbnails);
  gulp.watch(['*.html',
          '*.txt',
          '_chapters/*.md',
          '_appendices/*.md',
          '_pages/*.md',
          'assets/javascripts/**/**.js',
          'assets/images/**',
          'assets/fonts/**',
          '_layouts/**',
          '_includes/**',
          'assets/css/**'
        ],
        jekyllbuild);
  gulp.watch("docs/index.html").on('change', browserSync.reload);
}

var build = gulp.series(thumbnails, styles, jekyllbuild);

var buildjdb = gulp.series(thumbnails, styles, jekyllbuildjdb);

var builddeps = gulp.series(thumbnails, styles);

var dev = gulp.series(thumbnails, styles, jekyllbuild, browsersync, watch);

var devjdb = gulp.series(thumbnails, styles, jekyllbuildjdb, browsersync, watch);

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */

exports.styles = styles;
exports.thumbnails = thumbnails;
exports.jekyllbuild = jekyllbuild;
exports.jekyllbuildgitdocs = jekyllbuildgitdocs;
exports.jekyllbuildjdb = jekyllbuildjdb;
exports.watch = watch;
exports.builddeps = builddeps;
exports.dev = dev;
exports.build = build;
exports.devjdb = devjdb;
exports.buildjdb = buildjdb;
exports.default = dev;
