function showPage(name, url) {
  $('[data-page]').hide();
  if (name==='icons') $('#buttons').addClass('hidden');
  else $('#buttons').removeClass('hidden');
  $('[data-page="'+name+'"]').show();
  $('#header li').removeClass('selected');
  $('#header li.'+name).addClass('selected');
  if (url !== false) {
    if (name==='icons') setUrl($('#search input').val(), $('#icon h2').text());
    else setUrl('','');
  }
}
showPage('fg', false);

var glyphs;

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

function showIcon(icon, url) {
  if (icon && icon.code) {
    $('#icon i').removeClass().addClass('fg-'+icon.name)
    $('#icon h2').text('fg-' + icon.name);
    $('#icon .theme').text(icon.theme);
    $('#icon .code').text('\\'+icon.code.toString(16));
    if (url !== false) setUrl(null, icon.name);
  }
}

$.ajax({
  url: './font-gis.json',
  success: function(font) {
    glyphs = font.glyphs;
    var content = $('#content');
    var themes = {
      edition: [],
      geometry: [],
      search: [],
      measure: [],
      routing: [],
      layer: [],
      poi: [],
      map: [],
      globe: []
    };
    var g;
    for (g in font.glyphs) {
      if (!themes[font.glyphs[g].theme]) themes[font.glyphs[g].theme] = [];
      font.glyphs[g].id = g;
      themes[font.glyphs[g].theme].push(font.glyphs[g]);
    };
    Object.keys(themes).forEach(function(th) {
      var div = $('<div>').appendTo(content);
      $('<h2>').text(th).appendTo(div);
      themes[th].sort(function(a,b) { return a.order-b.order || a.code-b.code; });
      themes[th].forEach(function(gly) {
        // console.log(gly)
        $('<p>')
          .append($('<i>')
          .addClass(gly.id))
          .click(function() {
            showIcon(gly);
          })
          .append($('<span>').text(gly.name))
          .attr('title', '\\'+gly.code.toString(16))
          .appendTo(div);
      });
    })
    var data = getUrlData();
    if (data.q) {
      search(data.q);
    }
    if (data.fg) {
      showIcon(glyphs['fg-'+data.fg]);
      showPage('icons');
    } else {
      showIcon(glyphs['fg-earth'], false);
    }
  }
});