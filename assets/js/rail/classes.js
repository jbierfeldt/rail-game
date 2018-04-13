var Game = (function () {
	// private static
	var nextId = 1;
	
	// constructor
	
	var __constructor = function () {
		// private
		var id = nextId++;
		var players = [];
		var board = undefined;
		var nextTile = undefined;
		var turnNumber = 0;
		var playerCurrentTurn = undefined;
		
		// public (this instance only)
		this.get_id = function () {
			return id;
		};
		this.get_next_tile = function () {
			if (nextTile === undefined) {
				this.create_next_tile();
			}
			return nextTile;
		};
		this.get_board = function () {
			return board;
		};
		this.get_players = function () {
			return players;
		};
		this.get_turnNumber = function () {
			return turnNumber;
		};
		this.get_playerCurrentTurn = function () {
			return players[turnNumber%players.length];
		};
		this.save_game = function () {
			if (board !== undefined) {
				var boardSnapshot = board.get_snapshot();
			}
			var playerSnapshot = [];
			for (var i = 0; i < this.get_players().length; i++) {
				playerSnapshot.push(this.get_players()[i].get_properties());
			}
			var nextTileSnapshot = this.get_next_tile().get_properties();
			var gameSnapshot = {turnNumber: this.get_turnNumber()};
			
			
			return {game: gameSnapshot, board: boardSnapshot, players: playerSnapshot, nextTile: nextTileSnapshot}
		};
		this.load_game = function (json) {
			players = [];
			Player.reset_nextId();
			for (var i=0; i<json['players'].length; i++) {
				newPlayer = Player.create_player_from_properties(json['players'][i]);
				players.push(newPlayer);
			}
			
			newBoard = new Board(json['board']['size']);
			for (var i=0; i<json['board']['tiles'].length; i++) {
				newTile = Tile.create_tile_from_properties(json['board']['tiles'][i]['properties']);
				newBoard.add_tile_to_board(newTile, json['board']['tiles'][i].x, json['board']['tiles'][i].y);
			}
			for (var i=0; i<json['board']['paths'].length; i++) {
				var newPath = json['board']['paths'][i];
				newBoard.add_path_to_board(newPath);
			}
			board = newBoard;
			
			this.set_next_tile(Tile.create_tile_from_properties(json['nextTile']));
			
			this.set_turnNumber(json['game']['turnNumber']);
		};
		this.create_board = function (max_size) {
			var newBoard = new Board(max_size);
			board = newBoard;
			return newBoard;
		};
		this.create_next_tile = function () {
			var tile = Tile.randomTile();
			nextTile = tile;
			return tile;
		};
		this.set_next_tile = function (tile) {
			nextTile = tile;
		};
		this.set_turnNumber = function (int) {
			turnNumber = int;
		};
		this.create_new_player = function () {
			var newPlayer = new Player;
			players.push(newPlayer);
			return newPlayer;
		};
		this.next_turn = function () {
			turnNumber++;
		};
		
		// calculators
		
		this.calc_completed_path_points = function (path) {
			// calculates the value of a completed path
			// for the various players
			
			// if completed path...
			if (path.open_nodes.length === 0 && path.tiles.length > 0) {
				var playerList = this.get_players();
				var scoringObject = {};
				for (var i = 0; i < playerList.length; i++) {
					scoringObject[playerList[i].get_id()] = [];
				}
				
				// sort tiles into arrays based on players
				for (var i = 0; i < path.tiles.length; i++) {
					if (path.tiles[i].get_playedBy()) {
						scoringObject[path.tiles[i].get_playedBy()].push(path.tiles[i]);
					}
				}
				
				// winnersArray will contain the ids of the player(s)
				// who have the most tiles in the completed path
				var longest = -1;
				var winnersArray = [];
				Object.keys(scoringObject).forEach(function(key) {
					if (scoringObject[key].length > longest) {
						winnerArray = [];
						longest = scoringObject[key].length;
						winnerArray.push(Number(key));
					} else if (scoringObject[key].length == longest) {
						winnerArray.push(Number(key));
					}
				});
				console.log('winners: ', winnerArray);
				
				for (var i = 0; i < playerList.length; i++) {
					playerId = playerList[i].get_id()
					var pts = scoringObject[playerId].length;
					if (isInArray(playerId, winnerArray)) {
						var multiplier = 1 + (1/winnerArray.length);
						console.log(multiplier);
						pts = Math.round(pts * multiplier);
					}
					playerList[i].add_points(pts);
				}
				
				return winnerArray;
			}
		};
	};
	
	// public static
	__constructor.get_nextId = function () {
		return nextId;
	};
	
	return __constructor;
})();

var Player = (function () {
	// private static
	var nextId = 1;
	
	// constructor
	
	var __constructor = function () {
		// private
		var id = nextId++;
		var totalPoints = 0;
		var colorRGBList = [];

		// public (this instance only)
		this.get_id = function () {
			return id;
		};
		this.get_totalPoints = function () {
			return totalPoints;
		};
		this.get_colorRGBList = function () {
			return colorRGBList;
		};
		this.get_properties = function () {
			var properties_object = {
				totalPoints: totalPoints,
				colorRGBList: colorRGBList
			};
			return properties_object;
		};
		this.set_totalPoints = function (int) {
			totalPoints = int;
		};
		this.set_colorRGBList = function (list) {
			colorRGBList = list;
		};
		this.add_points = function (points_amt) {
			totalPoints += points_amt;
			return totalPoints;
		};

	};
	
	// public static
	__constructor.create_player_from_properties = function (player_properties) {
		console.log(player_properties);
		var newPlayer = new Player;
		newPlayer.set_totalPoints(player_properties.totalPoints);
		newPlayer.set_colorRGBList(player_properties.colorRGBList);
		return newPlayer;
	};
	__constructor.get_nextId = function () {
		return nextId;
	};
	__constructor.reset_nextId = function () {
		nextId = 1;
	};
	
	return __constructor;
})();

var Board = (function () {
	// private static
	var nextId = 1;
	
	// constructor
	
	var __constructor = function (max_size) {
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
			
			function walk(that, x, y, skip_direction) {
				var tile = coordinates[y][x];
				var tile_edges = tile.get_edges();
				tiles_on_path.push(tile);
				coords_on_path.push([x,y]);
				for (var i = 0; i < 4; i++) {
					// if edge is a path and isn't the edge
					// of the previous tile
					if (tile_edges[i] === 's' && i !== skip_direction) {
						switch (i) {
							// above
							case 0:
								nextCoord = that.get_coordinate(x, y-1);
								if (nextCoord instanceof Tile) {
									if (tiles_on_path.indexOf(nextCoord) === -1) {
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
	
	// public static
	__constructor.get_nextId = function () {
		return nextId;
	};
	
	return __constructor;	
})();

var Tile = (function () {
	// private static
	
	// firstID and nextID must match
	var firstId = 1;
	var nextId = 1;
	
	// constructor
	var __constructor = function () {
		// private
		var id = nextId++;
		var pieces = [];
		// edge order by index is top, right, bottom, left
		var edges = [];
		var isEndPoint = false;
		var type = undefined;
		var playedBy = undefined; // player object of player that played the tile
		
		// public (this instance only, created with new, access to private vars)
		this.check_is_starting_tile = function() {
			if (this.get_id() === firstId) {
				return true;
			} else {
				return false;
			}
		};
		
		this.get_id = function() {
			return id;
		};
		this.get_pieces = function () {
			return pieces;
		};
		this.get_edges = function () {
			return edges;
		};
		this.get_isEndPoint = function () {
			return isEndPoint;
		};
		this.get_type = function () {
			return type;
		};
		this.get_playedBy = function () {
			return playedBy;
		};
		this.get_properties = function () {
			var properties_object = {
				pieces: pieces,
				edges: edges,
				isEndPoint: isEndPoint,
				type: type,
				playedBy: playedBy
			};
			return properties_object;
		};
		this.set_edges = function (edge_array) {
			edges = edge_array;
		};
		this.set_isEndPoint = function (bool) {
			isEndPoint = bool;
		};
		this.set_type = function (string) {
			type = string;
		};
		this.set_playedBy = function (int) {
			playedBy = int;
		};
		this.add_piece = function (name) {
			var piece = name;
			pieces.push(piece);
		};
		this.rotate_edges = function () {
			edges.unshift(edges.pop());
		};
				
	};
	
	// public static
	__constructor.get_nextId = function () {
		return nextId;
	};
	__constructor.create_tile_from_properties = function (tile_properties) {
		var newTile = new Tile;
		newTile.set_edges(tile_properties.edges);
		newTile.set_isEndPoint(tile_properties.isEndPoint);
		newTile.set_type(tile_properties.type);
		newTile.set_playedBy(tile_properties.playedBy);
		return newTile;
	};
	// debug
	__constructor.randomTile = function () {
		var newTile = new Tile;
		var edgeChoices = ['g', 's'];
		var isEndPointChoices = [true, false, false, false]; // implement weighted choice later
		
		var validEdges = false;
		while (validEdges == false) {
			var edges = [
				choose(edgeChoices),
				choose(edgeChoices),
				choose(edgeChoices),
				choose(edgeChoices)	
			];
			// if all four edges are the same, redo
			// all identical edges could cause impossible moves
			if (arrayIsIdent(edges)) {
				continue;
			} else {
				validEdges = true;
			}
		}
		
		newTile.set_edges(edges);
		newTile.set_isEndPoint(choose(isEndPointChoices));

		return newTile;
	};
	
	//public (shared across instances) 
	__constructor.prototype = {
		check_surroundings: function () {
			console.log("The surrounding tiles are: ");
		}
	};
	
	return __constructor;
})();