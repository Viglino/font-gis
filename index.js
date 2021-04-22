$.ajax({
  url: './font-gis.json',
  success: function(font) {
    var content = $('#content');
    var themes = {};
    var th, g;
    for (g in font.glyphs) {
      if (!themes[font.glyphs[g].theme]) themes[font.glyphs[g].theme] = {};
      themes[font.glyphs[g].theme][g] = font.glyphs[g]
    };
    for (th in themes) {
      $('<h2>').text(th).appendTo(content);
      for (g in themes[th]) {
        console.log(themes[th][g])
        $('<p>')
          .append($('<i>')
          .addClass(g))
          .append($('<span>').text(themes[th][g].name))
          .attr('title', '\\'+themes[th][g].code.toString(16))
          .appendTo(content);
      };
    }
  }
});