var Game = (function () {
	// private static
	var nextId = 1;
	
	// constructor
	
	var gameInstance = function () {
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
			
			console.log(path);
			
			// if completed path...
			if (path.open_nodes.length === 0 && path.coords.length > 0) {
				var playerList = this.get_players(),
					presentTypeList = [],
					scoringObject = {};
				
				// create 'bucket' for each player
				for (var i = 0; i < playerList.length; i++) {
					scoringObject[playerList[i].get_id()] = {
						tiles: [],
						specialTiles: []
					};
				}
				
				// sort tiles into buckets based on players and count types
				for (var i = 0; i < path.coords.length; i++) {
					let tile = board.get_coordinate(path.coords[i][0], path.coords[i][1]),
						tilePlayedBy = tile.get_playedBy(),
						tileType = tile.get_type();
												
					if (tilePlayedBy) {
						scoringObject[tilePlayedBy].tiles.push(path.coords[i]);
						
						if (tileType) {
							scoringObject[tilePlayedBy].specialTiles.push(path.coords[i]);
							if (!isInArray(tileType, presentTypeList)) {
								presentTypeList.push(tileType);
							}
						}
					}
				}
								
				// winnersArray will contain the ids of the player(s)
				// who have the most tiles in the completed path
				var longest = -1;
				var winnersArray = [];
				Object.keys(scoringObject).forEach(function(key) {
					
					for (var i = 0; i < scoringObject[key].specialTiles.length; i++) {
// 						board.walk_until_specialTile(scoringObject[key].specialTiles[i][0], scoringObject[key].specialTiles[i][1]);
					}
					
					if (scoringObject[key].tiles.length > longest) {
						winnerArray = []; // clear array
						longest = scoringObject[key].length; // current length is new longest
						winnerArray.push(Number(key));
					} else if (scoringObject[key].tiles.length == longest) {
						winnerArray.push(Number(key));
					}
				});
				console.log('winners: ', winnerArray, 'present Types: ', presentTypeList);
				
				for (var i = 0; i < playerList.length; i++) {
					playerId = playerList[i].get_id()
					var pts = scoringObject[playerId].tiles.length;
					if (isInArray(playerId, winnerArray)) {
						var multiplier = 1 + (1/winnerArray.length);
						console.log('multiplier is: ', multiplier);
						pts = Math.round(pts * multiplier);
					}
					playerList[i].add_points(pts);
				}
				
				return winnerArray;
			}
		};
	};
	
	// public static
	gameInstance.get_nextId = function () {
		return nextId;
	};
	
	return gameInstance;
})();