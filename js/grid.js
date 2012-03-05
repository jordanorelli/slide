function Tile(grid, column, row) {
  this.elem = grid.paper.rect(grid.tileGutter * (column + 1) + column * grid.tileWidth,
                              grid.tileGutter * (row + 1) + row * grid.tileHeight,
                              grid.tileWidth,
                              grid.tileHeight,
                              grid.tileGutter);
  this.elem.tile = this; // circular reference.  probably bad.
  this.elem.attr("fill", "white");
  this.grid = grid;
  this.row = row;
  this.column = column;
  this.elem.mouseover(function() {
    if(this.tile.can_move()) {
      this.attr("fill", "red");
    }
  });
  this.elem.mouseout(function() {
    this.attr("fill", "white");
  });
  this.elem.click(function() {
    this.tile.move_down();
  });
}

// can move if in the same row as the empty tile and adjacent column
// can move if in the same column as the empty tile and adjacent row
Tile.prototype.can_move = function() {
  return true;
};

Tile.prototype.move_down = function() {
  this.elem.animate({
    y: this.elem.attrs.y + this.grid.tileHeight + this.grid.tileGutter
  }, 200, "ease-in-out");
  this.row += 1;
};

Tile.prototype.move_up = function () {
  this.elem.animate({
    y: this.elem.attrs.y - this.grid.tileHeight - this.grid.tileGutter
  });
};

function PuzzleGrid(container_id, width, height) {
  this.width = width;
  this.height = height;
  this.paper = new Raphael(container_id, width, height);

  this.rows = 4;
  this.columns = 4;
  this.empty_row = 3;
  this.empty_column = 3;
  this.tileGutter = 4; // spacing between tiles

  this.tileWidth = Math.floor((this.width - (1 + this.columns) * this.tileGutter) / this.columns);
  this.tileHeight = Math.floor((this.height - (1 + this.rows) * this.tileGutter) / this.rows);

  for(var x = 0; x < this.columns; x++) {
    for(var y = 0; y < this.rows; y++) {
      if(x == this.empty_row && y == this.empty_column) { continue; }
      new Tile(this, x, y);
    }
  }
}

// when invoked, tells us if our puzzlegrid is solved or not.
PuzzleGrid.prototype.solved = function() {
  return false;
};
