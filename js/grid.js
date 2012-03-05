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
    if(this.tile.can_move()) {
      this.tile.slide();
    };
  });
}

// can move if in the same row as the empty tile and adjacent column
// can move if in the same column as the empty tile and adjacent row
Tile.prototype.can_move = function() {
  if(this.row === this.grid.empty_row && Math.abs(this.column - this.grid.empty_column) === 1) {
    return true;
  } else if (this.column === this.grid.empty_column && Math.abs(this.row - this.grid.empty_row) === 1) {
    return true;
  }
  return false;
};

Tile.prototype.slide = function() {
  if(this.column === this.grid.empty_column) {
    if(this.row < this.grid.empty_row) {
      this.move("down");
    } else {
      this.move("up");
    }
  } else if (this.row === this.grid.empty_row) {
    if(this.column < this.grid.empty_column) {
      this.move("right");
    } else {
      this.move("left");
    }
  }
};

Tile.prototype.move = function(direction) {
  var params = {};
  switch(direction) {
    case "up":
      params = {
        y: this.elem.attrs.y - this.grid.tileHeight - this.grid.tileGutter
      };
      this.row--;
      this.grid.empty_row++;
      break;
    case "down":
      params = {
        y: this.elem.attrs.y + this.grid.tileHeight + this.grid.tileGutter
      };
      this.row++;
      this.grid.empty_row--;
      break;
    case "left":
      params = {
        x: this.elem.attrs.x - this.grid.tileWidth - this.grid.tileGutter
      };
      this.column--;
      this.grid.empty_column++;
      break;
    case "right":
      params = {
        x: this.elem.attrs.x + this.grid.tileWidth + this.grid.tileGutter
      };
      this.column++;
      this.grid.empty_column--;
      break;
  }
  this.elem.animate(params, 200, "ease-in-out");
  this.grid.log_empty();
};

function PuzzleGrid(container_id, width, height) {
  this.width = width;
  this.height = height;
  this.paper = new Raphael(container_id, width, height);

  this.rows = 4;
  this.columns = 4;
  this.empty_row = 2;
  this.empty_column = 3;
  this.tileGutter = 4; // spacing between tiles

  this.tileWidth = Math.floor((this.width - (1 + this.columns) * this.tileGutter) / this.columns);
  this.tileHeight = Math.floor((this.height - (1 + this.rows) * this.tileGutter) / this.rows);

  this.log_empty();

  for(var x = 0; x < this.columns; x++) {
    for(var y = 0; y < this.rows; y++) {
      if(x == this.empty_column && y == this.empty_row) { continue; }
      new Tile(this, x, y);
    }
  }
}

// when invoked, tells us if our puzzlegrid is solved or not.
PuzzleGrid.prototype.solved = function() {
  return false;
};

PuzzleGrid.prototype.log_empty = function() {
  /*
  console.log("Empty row: " + this.empty_row);
  console.log("Empty column: " + this.empty_column);
  */
};
