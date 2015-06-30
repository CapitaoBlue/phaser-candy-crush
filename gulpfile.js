var gulp = require('gulp'),
   nodemon = require('gulp-nodemon'),
   ts = require('gulp-typescript'),
   sourcemaps = require('gulp-sourcemaps'),
   browserify = require('gulp-browserify'),
   clean = require('gulp-clean'),
   changed = require('gulp-changed'),
   wiredep = require('wiredep').stream,
   inject = require('gulp-inject'),
   angularFilesort = require('gulp-angular-filesort');

var config = require('./config');

gulp.task('compile-server', compileServer);
gulp.task('compile-public', compilePublic);
gulp.task('watch-server', watchServer);
gulp.task('watch-public', watchPublic);
gulp.task('start', ['compile-server', 'compile-public'], start);
gulp.task('deploy', ['compile-server', 'compile-public']);
gulp.task('clean-js', cleanJs);
gulp.task('bower-inject', bowerInject);
gulp.task('custom-inject', customInject)

function compileServer(params) {
   return gulp.src(config.tsServerSrc)
   //.pipe(changed(config.destServer))
      .pipe(sourcemaps.init())
      .pipe(ts(config.tsCompiler)).js
      .pipe(gulp.dest(config.destServer));
}

function compilePublic(params) {
   var tsResult = gulp.src(config.tsPublicSrc)
      .pipe(sourcemaps.init())
      .pipe(ts(config.tsCompiler));

   return tsResult.js
   //.pipe(concat('output.js'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(config.destPublic));
}


function watchServer(params) {
   gulp.watch(config.tsServerSrc, ['compile-server']);
}


function watchPublic(params) {
   gulp.watch(config.tsPublicSrc, ['compile-public']);
}

function start(params) {
   nodemon({
      script: config.mainFile,
      ext: 'js',
   }).on('restart', function () {
      console.log('reload');
   }).on('start', function () {
      watchPublic();
      watchServer();
   });
}

function deploy(params) {
   return gulp.src(['package.json'])
      .pipe(gulp.dest('./deploy'));
}


function cleanJs(params) {
   var paths = [
      config.srcServer + '**/*.js',
      '!' + config.srcServer + 'public/libs/**/*.js'
   ]
   return gulp.src(paths, { read: false })
      .pipe(clean());
}

function bowerInject() {
   return gulp.src(config.tsServerSrc+'views/layout.vash')
      .pipe(wiredep())
      .pipe(gulp.dest(config.destServer+'views/'));
}

function customInject(params) {
   var target = gulp.src(config.srcServer+'views/layout.vash');
      // It's not necessary to read the files (will speed up things), we're only after their paths: 
      var sources = gulp.src(config.publicJsInject).pipe(angularFilesort());

      return target.pipe(inject(sources))
         .pipe(gulp.dest(config.destServer+'views/'));
}
