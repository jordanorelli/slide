var Grid = (function($) {
  var canvas = null;
  var context = null;
  var tileWidth = null;
  var tileHeight = null;
  var tiles = [];

  var draw = function(options) {
    var colWidth;
    var rowHeight;

    this.canvas = document.getElementById(options.id);
    this.context = this.canvas.getContext("2d");

    this.tileWidth = (this.canvas.width - (options.colGutter * (1 + options.columns))) / options.columns;
    this.tileHeight = (this.canvas.height - (options.rowGutter * (1 + options.rows))) / options.rows;

    colWidth = this.canvas.width / options.columns;
    rowHeight = this.canvas.height / options.rows;

    this.context.moveTo(0.5, 0);
    this.context.lineTo(0.5, this.canvas.height);

    for(var x = 0.5; x <= this.canvas.width + 0.5; x += colWidth) {
      this.context.moveTo(x, 0);
      this.context.lineTo(x, this.canvas.height + 0.5);
    }

    for(var y = 0.5; y <= this.canvas.height + 0.5; y += rowHeight) {
      this.context.moveTo(0, y);
      this.context.lineTo(this.canvas.width + 0.5, y);
    }

    this.context.strokeStyle = "#aaa";
    this.context.stroke();
  };

  return {
    draw: draw,
    canvas: canvas,
    context: context
  }
})(window.jQuery);
