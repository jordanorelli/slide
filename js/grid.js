function PuzzleGrid(container_id, width) {
  this.width = width;
  this.paper = new Raphael(container_id, width, width);
  this.tileGutter = 4; // spacing between tiles
  this.tileWidth = Math.floor((this.width - 5 * this.tileGutter) / 4);
  for(var x = this.tileGutter; x < this.width; x += this.tileWidth + this.tileGutter) {
    for(var y = this.tileGutter; y < this.width; y += this.tileWidth + this.tileGutter) {
      this.paper.rect(x, y, this.tileWidth, this.tileWidth);
    }
  }
}

// when invoked, tells us if our puzzlegrid is solved or not.
PuzzleGrid.prototype.solved = function() {
  return false;
};
