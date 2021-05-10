/** Color picker */
var picker = new ColorPicker($('#icon .color').get(0), $('#icon i').css('color'));
$('#icon .color').get(0).addEventListener('colorChange', function (e) {
  $('#icon i').css('color', e.detail.color.hexa);
});

function showPage(name, url) {
  $('[data-page]').hide();
  $('body').removeClass();
  $('body').addClass(name);
  $('[data-page="'+name+'"]').show();
  $('#header li').removeClass('selected');
  $('#header li.'+name).addClass('selected');
  if (url !== false) {
    if (name==='icons') setUrl($('#search input').val(), $('#icon h2').text());
    else setUrl('','');
  }
}
showPage('fg', false);

var glyphs, currentGlyph, version=0;

function search(val) {
  $('#search input').val(val);
  var n = 0;
  var rex = new RegExp(val,"i");
  $("#content h2").hide();
  $("#content p").each( function() {
    var k = $('i', this).get(0).className;
    var glyph = glyphs[k];
    var tags = (glyph.search || '').split(',');
    var found = rex.test(glyph.name) || rex.test(glyph.theme);
    tags.forEach(function(k) {
      found = found || rex.test(k);
    });
    if (found) {
      $(this).show();
      $('h2', $(this).parent()).show();
      n++;
    } else {
      $(this).hide();
    }
  });
  $("#search .nb").text(n);
  // Set search url
  setUrl(val);
}

function getUrlData() {
  var opt = document.location.search.replace(/^\?/,'').split('&');
  var data = {};
  opt.forEach(function(s) {
    if (s) {
      s = s.split('=');
      data[s[0]] = s[1];
    }
  });
  return data;
};

/** Set doc url */
function setUrl(search, select) {
  var url = document.location.href.split('?')[0];
  var data = getUrlData();
  var opt = [];
  if (typeof(search) === 'string') {
    if (search) opt.push('q='+search);
  } else {
    if (data.q) opt.push('q='+data.q);
  }
  if (typeof(select) === 'string') {
    if (select) opt.push('fg='+select.replace(/^fg-/,''));
  } else {
    if (data.fg) opt.push('fg='+data.fg);
  }
  opt = opt.join('&');
  if (opt) url = url + '?' + opt;
  window.history.replaceState (null, null, url);
};

$('#search input').on('keyup search', function() { 
  search(this.value); 
});

/** Show icon
 * @param {object} icon 
 * @param {boolean} [url] change url
 */
function showIcon(icon, url) {
  if (icon && icon.code) {
    currentGlyph = icon;
    $('#icon i').removeClass().addClass('fg-'+icon.name)
    $('#icon h2').text('fg-' + icon.name);
    $('#icon .theme').text(icon.theme);
    $('#icon .code').text('\\'+icon.code.toString(16));
    if (url !== false) setUrl(null, icon.name);
    var tags = icon.search.split(',');
    var tag = $('#icon .tags').html('');
    icon.name.split('-').forEach(function(t) {
      if (t.length>2 && t!==icon.theme && tags.indexOf(t)<0) tags.push(t);
    })
    tags.forEach(function(t) {
      if (t && t !== 'new') {
        $('<span>').text(t)
          .click(function() { search(t) })
          .appendTo(tag);
      }
    })
  }
}

/** Save glyph */
function save(opt) {
  $('#icon select').val('none');
  switch (opt) {
    case 'none': break;
    case 'svg': {
      console.log('savesvg')
      $.ajax({
        url: './svg/' 
          + currentGlyph.theme
          + '/u' + currentGlyph.code.toString(16).toUpperCase()
          + '-' + currentGlyph.name +'.svg',
        dataType : 'text',
        success: function(rep) {
          rep = rep.replace(/fill:#([^;|\"]*)/g, 'fill:' + $('#icon i').css('color'));
          var blob = new Blob([rep], {type: "text/plain;charset=utf-8"});
          saveAs(blob, currentGlyph.name + '.svg');
        }
      })
      break;
    }
    default: {
      var canvas = document.createElement('CANVAS');
      canvas.width = canvas.height = opt;
      var ctx = canvas.getContext('2d');
      ctx.font  = opt + 'px font-gis';
      ctx.fillStyle = $('#icon i').css('color');
      ctx.fillText(String.fromCharCode(currentGlyph.code), 0, opt * .8);
      canvas.toBlob(function(blob) {
        saveAs(blob, currentGlyph.name + '-' + opt + '.png');
      }, 'image/png');
      break;
    }
  }
}

/** Load data */
$.ajax({
  url: './font-gis.json',
  success: function(font) {
    glyphs = font.glyphs;
    var content = $('#content');
    var themes = {
      edit: [],
      geom: [],
      search: [],
      measure: [],
      tools: [],
      routing: [],
      layer: [],
      poi: [],
      map: [],
      globe: []
    };
    var g;
    var newDate = new Date((new Date()).getTime() - 7*24*60*60*1000);
    for (g in font.glyphs) {
      if (font.glyphs[g].version > version) version = font.glyphs[g].version;
      if (!themes[font.glyphs[g].theme]) themes[font.glyphs[g].theme] = [];
      font.glyphs[g].id = g;
      themes[font.glyphs[g].theme].push(font.glyphs[g]);
    };
    var news = 0;
    Object.keys(themes).forEach(function(th) {
      var div = $('<div>').appendTo(content);
      $('<h2>').text(th.replace('edit', 'edition').replace('geom', 'geometry')).appendTo(div);
      themes[th].sort(function(a,b) { return a.order-b.order || a.code-b.code; });
      themes[th].forEach(function(gly) {
        // console.log(gly)
        // var isNew = (gly.version===version) 
        var isNew = gly.date > newDate.toISOString();
        if (isNew) {
          gly.search += (gly.search?',':'') + 'new';
          news++;
        }
        $('<p>')
          .append($('<i>').addClass(gly.id))
          .click(function() {
            showIcon(gly);
          })
          .addClass(isNew ? 'new' : '')
          .append($('<span>').text(gly.name))
          .attr('title', '\\'+gly.code.toString(16))
          .appendTo(div);
      });
    })
    $('.news').text(news+(news>1?' NEWS':' NEW'));
    var data = getUrlData();
    search(data.q);
    if (data.fg) {
      showIcon(glyphs['fg-'+data.fg]);
      showPage('icons');
    } else {
      showIcon(glyphs['fg-earth'], false);
    }
  }
});