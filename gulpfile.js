var gulp = require('gulp');
var iconfont = require('gulp-iconfont');
// var iconfontCss = require('gulp-iconfont-css');
const rename = require('gulp-rename')
var async = require('async');
var consolidate = require('gulp-consolidate');
var fs = require('fs')
var pack = JSON.parse(fs.readFileSync('./package.json'))

var fontName = 'font-gis';    // set name of your symbol font
const className = 'fg'        // set class name in your CSS
const template = 'templates/template'  // or 'foundation-style'
var runTimestamp = Math.round(Date.now()/1000);
var today = (new Date()).toISOString().split('T')[0]

gulp.task('Iconfont', function(done){
  var iconStream = gulp.src(['svg/**/u*.svg', 'svg/**/*.svg'])
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
          license: pack.license
        }
        gulp.src(template+'.json')
          .pipe(consolidate('lodash', options))
          .pipe(rename({ basename: fontName }))
          .pipe(gulp.dest('./'));
        gulp.src(template+'.css')
          .pipe(consolidate('lodash', options))
          .pipe(rename({ basename: fontName }))
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

function mapGlyphs (glyph) {
  var font = JSON.parse(fs.readFileSync('./font-gis.json'));
  var resp = { name: glyph.name, codepoint: glyph.unicode[0].charCodeAt(0).toString(16), code: glyph.unicode[0].charCodeAt(0) };
  var glyph = font.glyphs[className+'-'+glyph.name];
  // Get back theme / search information
  if (glyph && glyph.theme) {
    resp.theme = glyph.theme;
    resp.search = glyph.search;
    resp.date = glyph.date;
    resp.order = glyph.order;
  }
  if (!resp.date) resp.date = today;
  if (!resp.order) resp.order = Math.round(((new Date()) - (new Date('2021')))/1000);
  console.log({ name: resp.name, code: resp.codepoint });
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

gulp.task("default", gulp.parallel("Iconfont", "store"));
