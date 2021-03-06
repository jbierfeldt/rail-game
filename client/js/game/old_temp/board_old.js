var Board = (function () {
	// private static
	var nextId = 1;
	
	// constructor
	
	var boardInstance = function (max_size) {
		// private
		var id = nextId++;
		var size = max_size;
		var coordinates = Create2DArray(size); //2d array of maximum coordinates
		var tiles = []; //array of tiles currently on board
		var paths = []; // array of completed paths on board
		
		// public (this instance only, created with new, access to private vars)
		
		// checkers (return t/f)
		this.check_coord_on_board = function (x, y) {
			try {
				if (coordinates[y][x] !== undefined) {
					return true;
				} else {
					return false;
				}
			} catch (e) {
				return false;
			}
		};
		this.check_coord_is_tile = function (x, y) {
			if (this.check_coord_on_board) {
				return coordinates[y][x] instanceof Tile;
			} else {
				return false;
			}
		};
		this.check_valid_edges = function(edge1, edge2) {
			// if edge2 is undefined, coord is not yet occupied
			// and move is thus valid
			if (edge1 === edge2 || edge2 === undefined) {
				return true;
			} else {
				return false;
			}
		};
		this.check_tile_edges_with_surroundings = function (tile, surroundings) {
			// tile is a Tile
			// surroundings is an array of Tiles or undefineds
			
			// break and return false when an edge
			// does not fit with its surroundings
			// return true if all checks pass
			
			// COULD DO i+2%length
			for (var i=0;i<surroundings.length;i++) {
				// check top edge			
				if (surroundings[0]) {
					if (this.check_valid_edges(
						tile.get_edges()[0],
						surroundings[0].get_edges()[2]
					) == false) { return false };
				}
				// check right edge
				if (surroundings[1]) {
					if (this.check_valid_edges(
						tile.get_edges()[1],
						surroundings[1].get_edges()[3]
					) == false) { return false };
				}
				// check bottom edge
				if (surroundings[2]) {
					if (this.check_valid_edges(
						tile.get_edges()[2],
						surroundings[2].get_edges()[0]
					) == false) { return false };
				}
				// check left edge
				if (surroundings[3]) {
					if (this.check_valid_edges(
						tile.get_edges()[3],
						surroundings[3].get_edges()[1]
					) == false) { return false };
				}
			}
			return true;
		};
		this.check_valid_placement = function (tile, x, y) {
			
			// if non-valid coord, false
			if (!this.check_coord_on_board(x, y)) { return false; };
			
			// if tile is already there, false
			if (this.check_coord_is_tile(x, y)) { return false; };
			
			var surroundings = this.get_coord_surroundings(x, y);
						
			// if coord has no adjacent tiles and is not starting tile
			if (surroundings.every(function(i){ if (!(i instanceof Tile)) {return true}}) & ! tile.check_is_starting_tile()) {
				return false;
			}
			
			// if edges don't match with surroundings
			if (!this.check_tile_edges_with_surroundings(tile, surroundings)) { return false; };
			
			// if everything passes
			return true;
		};
		
		this.check_path_status = function (x, y) {
			// function which checks the status the path on which
			// the given coordinates lie
			// returns path object  
			var tiles_on_path = [];
			var coords_on_path = [];
			var open_nodes = [];
			
			var initial_tile = coordinates[y][x];
			var surroundings = this.get_coord_surroundings(x, y);
			
			// recursive function which walks the path
			// skip_direction prevents the walk pointer from
			// going back down the same path twice
			function walk(that, x, y, skip_direction) {
				var tile = that.get_coordinate(x, y);
				var tile_edges = tile.get_edges();
				tiles_on_path.push(tile);
				coords_on_path.push([x,y]); // register the initial coords
				for (var i = 0; i < 4; i++) { // check all four directions
					// if edge is a path and isn't the edge
					// of the previous tile
					if (tile_edges[i] === 's' && i !== skip_direction) {
						switch (i) {
							// above
							case 0:
								nextCoord = that.get_coordinate(x, y-1);
								if (nextCoord instanceof Tile) {
									if (tiles_on_path.indexOf(nextCoord) === -1) { //prevents loop-backs
										//console.log("walking up...");
										walk(that,x,y-1,2);
									} else {
										continue;
									}
								} else if (nextCoord === 0) {
									open_nodes.push(tile);
								}
								break;
							// right
							case 1:
								nextCoord = that.get_coordinate(x+1, y);
								if (nextCoord instanceof Tile) {
									if (tiles_on_path.indexOf(nextCoord) === -1) {
										//console.log("walking right...");
										walk(that,x+1,y,3);
									} else {
										continue;
									}
								} else if (nextCoord === 0) {
									open_nodes.push(tile);
								}
								break;
							// below
							case 2:
								nextCoord = that.get_coordinate(x, y+1);
								if (nextCoord instanceof Tile) {
									if (tiles_on_path.indexOf(nextCoord) === -1) {
										//console.log("walking down...");
										walk(that,x,y+1,0);
									} else {
										continue;
									}
								} else if (nextCoord === 0) {
									open_nodes.push(tile);
								}
								break;
							// left
							case 3:
								nextCoord = that.get_coordinate(x-1, y);
								if (nextCoord instanceof Tile) {
									if (tiles_on_path.indexOf(nextCoord) === -1) {
										//console.log("walking left...");
										walk(that,x-1,y,1);
									} else {
										continue;
									}
								} else if (nextCoord === 0) {
									open_nodes.push(tile);
								}
								break;
						}
					}
				}
			};
			
			// start walking
			walk(this,x,y,undefined);
			
			return {tiles: tiles_on_path, open_nodes: open_nodes, coords: coords_on_path};
		};
		this.check_completed_path = function (x, y) {
			var status = this.check_path_status(x, y);
			
			if (status.open_nodes.length === 0 && status.tiles.length > 0) {
				console.log("Closed Circuit");
				return true;
			} else {
				return false;
			}
		};
		
		// getters
		this.get_id = function () {
			return id;
		}
		this.get_tile_list = function () {
			return tiles;
		};
		this.get_coord_surroundings = function (x, y) {
			var surrounding_tiles = [];
						
			try {
				surrounding_tiles.push(coordinates[y-1][x]);
			} catch (e) {
				surrounding_tiles.push(undefined);
			}
			try {
				surrounding_tiles.push(coordinates[y][x+1]);
			} catch (e) {
				surrounding_tiles.push(undefined);
			}
			try {
				surrounding_tiles.push(coordinates[y+1][x]);
			} catch (e) {
				surrounding_tiles.push(undefined);
			}
			try {
				surrounding_tiles.push(coordinates[y][x-1]);
			} catch (e) {
				surrounding_tiles.push(undefined);
			}
						
			return surrounding_tiles;
		};
		this.get_tile_surroundings = function (x, y) {
			// returns nested array containing
			// the object at the desired coordinate
			// followed by a list of the objects at the
			// surrounding coordinates
			
			// surroundings array is ordered by index
			// top, right, bottom, left
			
			// if coordinate contains tile
			try { 
				if (coordinates[y][x] instanceof Tile) {
					tile = coordinates[y][x];
				} else {
					tile = undefined;
				}
			} catch(e) {
				var tile = undefined;
			}
			
			var surrounding_tiles = this.get_coord_surroundings(x, y);
 			
			return [tile, surrounding_tiles];
		};
		this.get_coordinate = function (x,y) {
			try {
				return coordinates[y][x];
			} catch (e) {
				return undefined;
			}
		};
		this.get_coordinates = function () {
			return coordinates;
		};
		this.get_paths = function () {
			return paths;
		};
		
		// setters
		this.add_tile_to_board = function (tile, x, y) {
			coordinates[y][x] = tile;
			tiles.push(tile);
		};
		this.add_start_tile_to_board = function () {
			var start = new Tile;
			start.set_edges([
				'g',
				's',
				'g',
				's'
			]);
			this.add_tile_to_board(start, Math.floor(size / 2), Math.floor(size / 2));
		};
		this.add_path_to_board = function (path) {
			if (path.open_nodes.length === 0 && path.tiles.length > 0) {
				paths.push(path);
			}
		};
		
		
		// debug
		this.get_snapshot = function () {
			// function should generate a "snapshot"
			// of the board for saving/loading purposes
			var boardSnapshot = {
				size: size,
				num_of_tiles: tiles.length,
				'paths': paths,
				'tiles': []
			};
			var counter = 0;
			for (var i=0;i<coordinates.length;i++) {
				for (var j=0;j<coordinates[i].length;j++) {
					var coord_content = coordinates[i][j];
					if (coord_content instanceof Tile) {
						coord_content = coord_content.get_properties();
						boardSnapshot['tiles'].push({
							x: j,
							y: i,
							properties: coord_content
						});
						counter++;
					}
				}
			}
			return boardSnapshot;
		};
	};
	
	//public (shared across instances) 
	boardInstance.prototype = {
		walk_until_specialTile: function (x, y) {
			
			// recursive function which walks the path
			// skip_direction prevents the walk pointer from
			// going back down the same path twice
			function walk(that, x, y, skip_direction) {
				var tile = that.get_coordinate(x, y);
				var tile_edges = tile.get_edges();
				tiles_on_path.push(tile);
				coords_on_path.push([x,y]); // register the initial coords
				for (var i = 0; i < 4; i++) { // check all four directions
					// if edge is a path and isn't the edge
					// of the previous tile
					if (tile_edges[i] === 's' && i !== skip_direction) {
						switch (i) {
							// above
							case 0:
								nextCoord = that.get_coordinate(x, y-1);
								if (nextCoord instanceof Tile) {
									if (tiles_on_path.indexOf(nextCoord) === -1) { //prevents loop-backs
										//console.log("walking up...");
										walk(that,x,y-1,2);
									} else {
										continue;
									}
								} else if (nextCoord === 0) {
									open_nodes.push(tile);
								}
								break;
							// right
							case 1:
								nextCoord = that.get_coordinate(x+1, y);
								if (nextCoord instanceof Tile) {
									if (tiles_on_path.indexOf(nextCoord) === -1) {
										//console.log("walking right...");
										walk(that,x+1,y,3);
									} else {
										continue;
									}
								} else if (nextCoord === 0) {
									open_nodes.push(tile);
								}
								break;
							// below
							case 2:
								nextCoord = that.get_coordinate(x, y+1);
								if (nextCoord instanceof Tile) {
									if (tiles_on_path.indexOf(nextCoord) === -1) {
										//console.log("walking down...");
										walk(that,x,y+1,0);
									} else {
										continue;
									}
								} else if (nextCoord === 0) {
									open_nodes.push(tile);
								}
								break;
							// left
							case 3:
								nextCoord = that.get_coordinate(x-1, y);
								if (nextCoord instanceof Tile) {
									if (tiles_on_path.indexOf(nextCoord) === -1) {
										//console.log("walking left...");
										walk(that,x-1,y,1);
									} else {
										continue;
									}
								} else if (nextCoord === 0) {
									open_nodes.push(tile);
								}
								break;
						}
					}
				}
			};
			
			// start walking
			walk(this,x,y,undefined);
			
			return {tiles: tiles_on_path, open_nodes: open_nodes, coords: coords_on_path};
		}
	};
	
	// public static
	boardInstance.get_nextId = function () {
		return nextId;
	};
	
	return boardInstance;	
})();