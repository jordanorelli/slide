var Grid = (function($) {
  var canvas = null;
  var context = null;

  var draw = function(canvasId, density) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");
    console.log(this.canvas.width);
    for(var x = 0; x <= this.canvas.width; x += density) {
      this.context.moveTo(x, 0);
      this.context.lineTo(x, this.canvas.height);
    }
    for(var y = 0; y <= this.canvas.height; y += density) {
      this.context.moveTo(0, y);
      this.context.lineTo(this.canvas.width, y);
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
