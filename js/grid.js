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
  this.locked = false;
  if(this.can_move()) {
    this.elem.attr({cursor: "hand"});
  }
  this.elem.mouseover(function() {
    eve("tile-mouseover", this.tile.grid, this.tile);
  });
  this.elem.mouseout(function() {
    eve("tile-mouseout", this.tile.grid, this.tile);
  });
  this.elem.click(function() {
    eve("tile-click", this.tile.grid, this.tile, 200);
  });
}

// returns true if the tile is in its proper place in the solution image, false
// if otherwise.
Tile.prototype.in_place = function() {
  return this.column === this.solution_column && this.row === this.solution_row;
};

Tile.prototype.highlight = function() {
  this.elem.animate({"fill-opacity": 0.6}, 250, "ease-out");
};

Tile.prototype.unhighlight = function() {
  this.elem.animate({"fill-opacity": 1.0}, 250, "ease-out");
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
  return !!this.move_direction() && !this.locked;
};

Tile.prototype.move = function(duration) {
  if(!this.can_move()) {
    return;
  }
  var params = {};
  switch(this.move_direction()) {
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
  this.locked = true;
  eve("tile-animation-start", this);
  this.elem.animate(params, duration, "ease-out", function() {
    this.tile.locked = false;
    eve("tile-animation-end", this.tile);
  });
};

function PuzzleGrid(container_id, control_container_id, width, height) {
  this.width = width;
  this.height = height;
  this.paper = new Raphael(container_id, width, height);

  this.rows = 4;
  this.columns = 4;
  this.empty_row = 3;
  this.empty_column = 3;
  this.tileGutter = 4; // spacing between tiles

  this.scramble_lock = false;
  this.tileWidth = Math.floor((this.width - (1 + this.columns) * this.tileGutter) / this.columns);
  this.tileHeight = Math.floor((this.height - (1 + this.rows) * this.tileGutter) / this.rows);

  this.tiles = [];

  for(var x = 0; x < this.columns; x++) {
    for(var y = 0; y < this.rows; y++) {
      if(x == this.empty_column && y == this.empty_row) { continue; }
      this.tiles.push(new Tile(this, x, y, x, y));
    }
  }
  this.last_randomly_moved_tile = this.tiles[0];
  eve.on("tile-click", this.move_tiles);
  eve.on("tile-mouseover", this.mouseover_tile);
  eve.on("tile-mouseout", this.mouseout_tile);

  this.controls = new Controls(this, control_container_id, 100, 100);
  eve.on("whisk-click", this.scramble);
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

PuzzleGrid.prototype.random_tile = function() {
  return this.tiles[Math.floor(Math.random() * this.tiles.length)];
};

PuzzleGrid.prototype.random_move = function() {
  var tile = this.random_tile();
  var moved = false;
  while(!moved) {
    if(tile.can_move() && tile != this.last_randomly_moved_tile) {
      this.move_tiles(tile, 40, function() {
        eve("random-move-end", tile);
      });
      this.last_randomly_moved_tile = tile;
      moved = true;
    } else {
      tile = this.random_tile();
    }
  }
}

PuzzleGrid.prototype.move_tiles = function(source_tile, duration, callback) {
  if(source_tile.can_move()) {
    var source_row = source_tile.row;
    var source_column = source_tile.column;
    var group = this.get_movement_group(source_tile);
    $.each(group, function(i, item) {
      item.move(duration);
      item.unhighlight();
    });
    this.empty_row = source_row;
    this.empty_column = source_column;

    var tiles_moved = 0;
    var that = this;
    eve.on("tile-animation-end", function() {
      tiles_moved++;
      for(var i = 0; i < that.tiles.length; i++) {
        if(that.tiles[i].can_move()) {
          that.tiles[i].elem.attr({cursor: "hand"});
        } else {
          that.tiles[i].elem.attr({cursor: "default"});
        }
      }
      if(typeof callback !== "undefined") {
        callback();
      }
    });
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

PuzzleGrid.prototype.scramble = function() {
  if(!this.scramble_lock) {
    this.scramble_lock = true;
    var that = this;
    var move_count = 0;
    var step = function() {
      if(move_count < 125) {
        that.random_move();
      } else {
        eve.off("random-move-end", step);
        that.scramble_lock = false;
      }
      move_count++;
    }
    eve.on("random-move-end", step);
    this.random_move();
  }
};

Controls = function(puzzle, container_id, width, height) {
  this.paper = new Raphael(container_id, 100, 100);
  // whisk image courtesy of The Noun Project: http://thenounproject.com/
  this.whisk = this.paper.set();
  this.paper.importSVG('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"> <g> <path d="M38.819,61.33c-2.268-2.27-5.943-2.27-8.21,0L5.393,86.545c-2.267,2.267-2.267,5.941,0.001,8.21   c2.266,2.267,5.941,2.267,8.208,0l25.216-25.214C41.085,67.271,41.085,63.596,38.819,61.33z"/> <path fill="none" stroke="#000000" stroke-width="1.0248" stroke-miterlimit="10" d="M33.022,67.127c0,0,37.88-25.279,49.441-36.84   c13.571-13.566,7.306-19.907,7.306-19.907"/> <path fill="none" stroke="#000000" stroke-width="1.0248" stroke-miterlimit="10" d="M32.875,66.979c0,0,34.191-29.24,45.752-40.8   c13.567-13.569,10.994-15.946,10.994-15.946"/> <path fill="none" stroke="#000000" stroke-width="1.0248" stroke-miterlimit="10" d="M33.022,67.127   c0,0,41.891-21.34,53.453-32.901c13.57-13.57,3.294-23.846,3.294-23.846"/> <path fill="none" stroke="#000000" stroke-width="1.0248" stroke-miterlimit="10" d="M33.022,67.127   c0,0,45.867-17.367,57.427-28.928c13.567-13.568-0.681-27.819-0.681-27.819"/> <g> <path fill="none" stroke="#000000" stroke-width="1.0248" stroke-miterlimit="10" d="M32.728,66.834    c0,0,25.277-37.884,36.838-49.444c13.567-13.569,19.909-7.304,19.909-7.304"/> <path fill="none" stroke="#000000" stroke-width="1.0248" stroke-miterlimit="10" d="M32.875,66.979    c0,0,29.241-34.189,40.802-45.75c13.566-13.57,15.944-10.996,15.944-10.996"/> <path fill="none" stroke="#000000" stroke-width="1.0248" stroke-miterlimit="10" d="M32.728,66.834    c0,0,21.341-41.895,32.9-53.456c13.569-13.568,23.847-3.293,23.847-3.293"/> <path fill="none" stroke="#000000" stroke-width="1.0248" stroke-miterlimit="10" d="M32.728,66.834    c0,0,17.365-45.87,28.929-57.431c13.565-13.566,27.818,0.682,27.818,0.682"/> </g> </g> </svg>', this.whisk);
  this.whisk.push(this.paper.rect(0, 0, 100, 100, 8).attr({fill: "#000", "fill-opacity": 0}));
  this.whisk.attr({cursor: "hand"});
  this.whisk.click(function() {
    eve("whisk-click", puzzle);
  });
};

