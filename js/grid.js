function Tile(grid, column, row, solution_column, solution_row) {
  this.elem = grid.paper.rect(grid.tileGutter * (column + 1) + column * grid.tileWidth,
                              grid.tileGutter * (row + 1) + row * grid.tileHeight,
                              grid.tileWidth,
                              grid.tileHeight,
                              grid.tileGutter);
  this.elem.tile = this; // circular reference.  probably bad.
  this.elem.attr({
    fill: "url(/img/globe_" + column + "_" + row + ".jpg)",
    "fill-opacity": 1.0,
  });
  this.grid = grid;
  this.row = row;
  this.column = column;
  this.solution_row = solution_row;
  this.solution_column = solution_column;
  this.elem.mouseover(function() {
    eve("tile-mouseover", this.tile.grid, this.tile);
  });
  this.elem.mouseout(function() {
    eve("tile-mouseout", this.tile.grid, this.tile);
  });
  this.elem.click(function() {
    eve("tile-click", this.tile.grid, this.tile);
  });
}

// returns true if the tile is in its proper place in the solution image, false
// if otherwise.
Tile.prototype.in_place = function() {
  return this.column === this.solution_column && this.row === this.solution_row;
};

Tile.prototype.highlight = function() {
  this.elem.attr("fill-opacity", 0.50);
};

Tile.prototype.unhighlight = function() {
  this.elem.attr("fill-opacity", 1.0);
};

Tile.prototype.move_direction = function() {
  if(this.column === this.grid.empty_column) {
    if(this.row < this.grid.empty_row) {
      return "down";
    } else {
      return "up";
    }
  } else if (this.row === this.grid.empty_row) {
    if(this.column < this.grid.empty_column) {
      return "right";
    } else {
      return "left";
    }
  } else {
    return false;
  }
};

Tile.prototype.can_move = function() {
  return !!this.move_direction();
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
      break;
    case "down":
      params = {
        y: this.elem.attrs.y + this.grid.tileHeight + this.grid.tileGutter
      };
      this.row++;
      break;
    case "left":
      params = {
        x: this.elem.attrs.x - this.grid.tileWidth - this.grid.tileGutter
      };
      this.column--;
      break;
    case "right":
      params = {
        x: this.elem.attrs.x + this.grid.tileWidth + this.grid.tileGutter
      };
      this.column++;
      break;
  }
  this.elem.animate(params, 200, "ease-out");
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

  this.tiles = [];

  for(var x = 0; x < this.columns; x++) {
    for(var y = 0; y < this.rows; y++) {
      if(x == this.empty_column && y == this.empty_row) { continue; }
      this.tiles.push(new Tile(this, x, y, x, y));
    }
  }
  eve.on("tile-click", this.move_tiles);
  eve.on("tile-mouseover", this.mouseover_tile);
  eve.on("tile-mouseout", this.mouseout_tile);
}

// when invoked, tells us if our puzzlegrid is solved or not.
PuzzleGrid.prototype.solved = function() {
  return false;
};

// given a source tile, retrieve a list of all tiles between the source tile
// and the empty cell.  Should return an empy list of the source tile is not
// moveable.
PuzzleGrid.prototype.get_movement_group = function(source_tile) {
  if(!source_tile.can_move()) {
    return [];
  }
  var group = [];
  if(source_tile.row === this.empty_row) {
    if(source_tile.column < this.empty_column) {
      for(var i = source_tile.column; i < this.empty_column; i++) {
        group.push(this.get_tile(i, source_tile.row));
      }
    } else {
      for(var i = source_tile.column; i > this.empty_column; i--) {
        group.push(this.get_tile(i, source_tile.row));
      }
    }
  } else if(source_tile.column === this.empty_column) {
    if(source_tile.row < this.empty_row) {
      for(var i = source_tile.row; i < this.empty_row; i++) {
        group.push(this.get_tile(source_tile.column, i));
      }
    } else {
      for(var i = source_tile.row; i > this.empty_row; i--) {
        group.push(this.get_tile(source_tile.column, i));
      }
    }
  } else {
    console.log("what is this?  I don't even.");
  }
  return group;
};

PuzzleGrid.prototype.get_tile = function(column, row) {
  for(var i = 0; i < this.tiles.length; i++) {
    if(this.tiles[i].column === column && this.tiles[i].row === row) {
      return this.tiles[i];
    }
  }
};

PuzzleGrid.prototype.move_tiles = function(source_tile) {
  if(source_tile.can_move()) {
    var group = this.get_movement_group(source_tile);
    var direction = source_tile.move_direction();
    $.each(group, function(i, item) {
      item.slide();
      item.unhighlight();
    });
    switch(direction) {
      case "up":
        this.empty_row += group.length;
        break;
      case "down":
        this.empty_row -= group.length;
        break;
      case "left":
        this.empty_column += group.length;
        break;
      case "right":
        this.empty_column -= group.length;
        break;
    }
  }
};

PuzzleGrid.prototype.mouseover_tile = function(source_tile) {
  if(source_tile.can_move()) {
    $.each(this.get_movement_group(source_tile), function(i, item) {
      item.highlight();
    });
  }
};

PuzzleGrid.prototype.mouseout_tile = function(source_tile) {
  if(source_tile.can_move()) {
    $.each(this.get_movement_group(source_tile), function(i, item) {
      item.unhighlight();
    });
  }
};

PuzzleGrid.prototype.log_empty = function() {
  /*
  console.log("Empty row: " + this.empty_row);
  console.log("Empty column: " + this.empty_column);
  */
};
