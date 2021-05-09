var gulp = require('gulp');
var iconfont = require('gulp-iconfont');
// var iconfontCss = require('gulp-iconfont-css');
const rename = require('gulp-rename')
const vinylPaths = require('vinyl-paths');
const del = require('del');
var async = require('async');
var consolidate = require('gulp-consolidate');
var fs = require('fs')
var pack = JSON.parse(fs.readFileSync('./package.json'))

var fontName = 'font-gis';    // set name of your symbol font
const className = 'fg'        // set class name in your CSS
const template = 'templates/template'  // or 'foundation-style'
var runTimestamp = Math.round(Date.now()/1000);
var today = (new Date()).toISOString().split('T')[0]

var version = process.env.npm_package_version.split('.');
version = 10000*version[0] + 100*version[1] + version[2];

const es = require('event-stream');
var path = require('path');
var fileDir = {};

function logFile() {
  return es.map(function(file, cb) {
    var dir = path.parse(file.path).dir;
    var name = path.parse(file.path).name.replace(/^u[^-]*-/,'');
    fileDir[name] = path.parse(dir).name;
    return cb(null, file);
  });
};

gulp.task('Iconfont', function(done) {
  var iconStream = gulp.src(['svg/**/u*.svg', 'svg/**/*.svg'])
    .pipe(logFile()) 
    .pipe(iconfont({ 
      fontName: fontName,
      prependUnicode: true, // recommended option
      formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'], // default, 'woff2' and 'svg' are available
      fontHeight: 1000,
      descent: 200,
      normalize: true,
      timestamp: runTimestamp // recommended to get consistent builds when watching files
    }));

  async.parallel([
    function handleGlyphs (cb) {
      iconStream.on('glyphs', function(glyphs) {
        const options = {
          className,
          fontName,
          fontPath: '../fonts/', // set path to font (from your CSS file if relative)
          dtime: (new Date()).getTime(),
          glyphs: glyphs.map(mapGlyphs),
          author: pack.author.name,
          git: pack.author.name,
          homepage: pack.homepage,
          version: pack.version,
          keywords: pack.keywords.join(' - '),
          year: (new Date()).getFullYear(),
          desc: pack.description,
          license: pack.license
        }
        gulp.src(template+'.json')
          .pipe(consolidate('lodash', options))
          .pipe(rename({ basename: fontName }))
          .pipe(gulp.dest('./'));
        gulp.src(template+'.css')
          .pipe(consolidate('lodash', options))
          .pipe(rename({ basename: 'temp' }))
          .pipe(gulp.dest('css/'))
          .on('finish', cb);
      });
    },
    function handleFonts (cb) {
      iconStream
        .pipe(gulp.dest('fonts/'))
        .on('finish', cb);
    }
  ], done);
});

/** Get glyphs */
var font = JSON.parse(fs.readFileSync('./font-gis.json'));

function mapGlyphs (glyph) {
  var resp = { 
    name: glyph.name, 
    theme: fileDir[glyph.name],
    codepoint: glyph.unicode[0].charCodeAt(0).toString(16), 
    code: glyph.unicode[0].charCodeAt(0)
  };
  var glyph = font.glyphs[className+'-'+glyph.name];
  // Get back theme / search information
  if (glyph && glyph.theme) {
    resp.search = glyph.search;
    resp.order = glyph.order;
    resp.version = glyph.version;
    resp.date = glyph.date;
  }
  if (!resp.order) resp.order = Math.round(((new Date()) - (new Date('2021')))/1000);
  if (!resp.version) resp.version = version;
  if (!resp.date) resp.date = today;
//  console.log({ name: resp.name, code: resp.codepoint });
  return resp;
}

/** Reset names */
gulp.task('resname', function(){
  return gulp.src(['svg/**/u*.svg'])
    .pipe(rename(function (path) {
      path.dirname = '';
      path.basename = path.basename.replace(/u([^-]*)-/,'');
    }))
    .pipe(gulp.dest("./dist"));
});

/** Use svgstore to create svg sprites */
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var cheerio = require('gulp-cheerio');

gulp.task('store', function(){
  return gulp.src(['svg/**/u*.svg'])
    .pipe(rename(function (path) {
      path.dirname = '';
      path.basename = 'fg-' + path.basename.replace(/u([^-]*)-/,'');
    }))
    .pipe(svgmin({
      plugins: [{
        removeAttrs: {attrs: '(stroke|fill|style|color|font-weight|font-family|stroke-width)'}
        /* not working...
        removeViewBox: false,
        addAttributesToSVGElement: {
          attributes: [
            { 
              fill: 'currentColor' 
            }, { 
              'aria-hidden': true 
            }
          ]
        }
        */
      }]
    }))
    .pipe(svgstore())
    .pipe(cheerio({
      run: function ($) {
        // Set SVG attributes
        $('svg').attr('style', 'display:none');
        $('symbol').attr('fill', 'currentColor');
        $('symbol').attr('viewBox', '0 0 100 100');
        $('symbol').attr('aria-hidden', 'true');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(rename(function (path) {
      path.basename = 'font-gis';
    }))
    .pipe(gulp.dest('./dist'));
});

// Rename css to force watch / serve
gulp.task('renameCSS', function(){
  return gulp.src('./css/temp.css')
    .pipe(vinylPaths(del)) // delete the original disk copy
    .pipe(rename(function (path) {
      path.basename = fontName;
    }))
    .pipe(gulp.dest("./css"));
});

gulp.task("default", gulp.series(gulp.task("Iconfont"), gulp.task("store"), gulp.task("renameCSS")));
