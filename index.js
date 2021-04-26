function showPage(name) {
  $('[data-page]').hide();
  $('[data-page="'+name+'"]').show();
  $('#header li').removeClass('selected');
  $('#header li.'+name).addClass('selected');
}
showPage('fg');

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
  var url = document.location.href.split('?')[0] 
    + (val ? '?' + val : '');
  window.history.replaceState (null, null, url);
}

$('#search input').on('keyup search', function() { search(this.value); });

$.ajax({
  url: './font-gis.json',
  success: function(font) {
    glyphs = font.glyphs;
    function showIcon(icon) {
      $('#icon i').removeClass().addClass('fg-'+icon.name)
      $('#icon h2').text('fg-' + icon.name);
      $('#icon .theme').text(icon.theme);
      $('#icon .code').text('\\'+icon.code.toString(16));
    }
    var content = $('#content');
    var themes = {};
    var g;
    for (g in font.glyphs) {
      if (!themes[font.glyphs[g].theme]) themes[font.glyphs[g].theme] = {};
      themes[font.glyphs[g].theme][g] = font.glyphs[g]
    };
    Object.keys(themes).forEach(function(th) {
      var div = $('<div>').appendTo(content);
      $('<h2>').text(th).appendTo(div);
      Object.keys(themes[th]).forEach(function(g) {
        // console.log(themes[th][g])
        $('<p>')
          .append($('<i>')
          .addClass(g))
          .click(function() {
            showIcon(themes[th][g]);
          })
          .append($('<span>').text(themes[th][g].name))
          .attr('title', '\\'+themes[th][g].code.toString(16))
          .appendTo(div);
      });
    })
    showIcon(themes.globe['fg-earth']);
    var s = document.location.search.replace('?','');
    if (s) {
      search(s);
      showPage('icons');
    }
  }
});