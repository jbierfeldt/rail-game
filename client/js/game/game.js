define(['game/board', 'game/player', 'game/tile', 'lib/pathfinding'], function(Board, Player, Tile, path) {

	// private static
	let nextId = 1;

	const Game = Class.extend({

		init: function(app) {
			this.app = app;
			this.id = nextId++;
			this.options = null;

			this.debug = app.debug;

			this.board = null;
			this.players = [];

			this.nextTile = null;
			this.turnNumber = 0;
			this.maximumTurns = Infinity;
		},

		setup: function(options) {
			this.options = options || {};

			if (options.playerNum) {
				for (let i = 0; i < options.playerNum; i++) {
					const newPlayer = new Player(options.playerColors[i], 0);
					this.players.push(newPlayer);
				}
			}

			if (options.maximumTurns) {
				this.maximumTurns = options.maximumTurns;
			}

			this.createNewBoard(options.boardSize);
			this.createNextTile();
			if (this.debug) console.log("Starting Game...", this);
		},

		getCurrentPlayerTurn: function() {
			return this.players[this.turnNumber%this.players.length];
		},

		saveGame: function() {
			var gameProperties = {
				nextTile: this.nextTile.getProperties(),
				turnNumber: this.turnNumber
			};
			if (this.board) {
				var boardProperties = this.board.getProperties();
			}
			var playerProperties = [];
			for (let i = 0; i < this.players.length; i++) {
				playerProperties.push(this.players[i].getProperties());
			}

			return {game: gameProperties, board: boardProperties, player: playerProperties};
		},

		loadGame: function(json) {
			// workaround to reset id numbers
			new Player().resetNextId();

			// players
			let players = [];
			for (let i = 0; i < json['player'].length; i++) {
				let newPlayer = new Player(json['player'][i].color, json['player'][i].points);
				players.push(newPlayer);
				this.players = players;
			}

			// game
			this.turnNumber = json['game'].turnNumber;
			this.nextTile = new Tile(
				json['game'].nextTile.type,
				json['game'].nextTile.edges,
				json['game'].nextTile.playedBy
			);

			// board
			this.createNewBoard(json['board'].size);
			this.board.paths = json['board'].paths;
			for (let i = 0; i < json['board'].tiles.length; i++) {
				let newTile = new Tile(
					json['board'].tiles[i].tileProperties.type,
					json['board'].tiles[i].tileProperties.edges,
					json['board'].tiles[i].tileProperties.playedBy,
					json['board'].tiles[i].tileProperties.startTile
				);
				this.board.coordinates[json['board'].tiles[i].y][json['board'].tiles[i].x] = newTile;
			}

		},

		createNewBoard: function(size) {
			this.board = new Board(this, size);
		},

		createRandomTile: function() {
			const edgeChoices = ['g', 's'];
			const typeChoices = [undefined, undefined, undefined, undefined, undefined,
				'factory', 'house', 'mine']; // implement weighted choice later

				const type = choose(typeChoices);

				// validate edges
				let validEdges = false;
				while (validEdges === false) {
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

				const newTile = new Tile(type, edges);
				return newTile;
			},

			createNextTile: function() {
				this.nextTile = this.createRandomTile();
			},

			createNewPlayer: function(color, points) {
				const newPlayer = new Player(color, points || 0);
				this.players.push(newPlayer);
			},

			calcCompletedPathScore: function(path) {
				const self = this;
				// calculates the value of a completed path
				// for the various players
				if (this.debug) console.log("Calculating Path Score...", path);

				const scoringObject = {};
				const specialTiles = {};

				for (let i = 0; i < path.nodesOnPath.length; i++) {
					// add initial value of tile for score
					path.nodesOnPath[i].value = 1;
					// if tile has a type, push it to specialTiles for
					// later score calculating
					if (path.nodesOnPath[i].type) {
						if (!specialTiles[path.nodesOnPath[i].type]) {
							specialTiles[path.nodesOnPath[i].type] = [];
						}
						path.nodesOnPath[i].loaded = false;
						path.nodesOnPath[i].supplying = false;
						specialTiles[path.nodesOnPath[i].type].push(path.nodesOnPath[i]);
					}
				}

				const calcSpecialTileBonus = function(specialTiles, startType, endType, bonusAmount, mustBeLoaded) {
					// if there is at least one startType on path...
					if (specialTiles[startType] && specialTiles[endType]) {
						// for each of startType...
						for (let i = 0; i < specialTiles[startType].length; i++) {
							// if startType must be loaded, and isn't, then return
							if (mustBeLoaded && !specialTiles[startType][i].loaded) {
								if (self.debug) console.log(`${startType} has no suppliers.`);
								return;
							}
							// get dijkstraTree which contains costs to each node on Path
							let startId = specialTiles[startType][i].id;
							let dijkstraTree = getDijkstraTree(path.nodesOnPath, startId);
							// for each of endType...
							for (let j = 0; j < specialTiles[endType].length; j++) {
								// get dijkstraScore which contains optimalPath from
								// startType to endType
								let finishId = specialTiles[endType][j].id;
								if (self.debug) console.log(`${startType}:${startId} to ${endType}:${finishId}`);
								let dijkstraScore = getOptimalPathFromTree(dijkstraTree, finishId);
								// check validity
								// if greater than 2000, then invalid
								if (dijkstraScore.targetScore < 2000) {
									if (self.debug) console.log("valid", dijkstraScore.targetScore);
									// mark endType as 'loaded' for use in further calculation
									specialTiles[endType][j].loaded = true;
									specialTiles[startType][i].supplying = true;
									// add a bonus to the specialTile equal to the length of the
									// path between the startType and endType
									specialTiles[startType][i].value += (dijkstraScore.targetScore - 1000) * bonusAmount;
								} else {
									if (self.debug) console.log("invalid - Path passes through another special Node.", dijkstraScore.targetScore)
								}
							}
						}
					} else {
						if (self.debug) console.log("At least one type of endpoint is missing.");
					}
				};

				// mine->factory, bonus: 1, mustBeLoaded = false
				calcSpecialTileBonus(specialTiles, 'mine', 'factory', 1, false);
				// mine->factory, bonus: 2, mustBeLoaded = true
				calcSpecialTileBonus(specialTiles, 'factory', 'house', 2, true);

				if (this.debug) console.log(specialTiles, path);

				// for each node on the path that belongs to player,
				// give that player the value of the tile
				for (let i = 0; i < path.nodesOnPath.length; i++) {
					if (path.nodesOnPath[i].playedBy) {
						this.players[path.nodesOnPath[i].playedBy - 1].addPoints(path.nodesOnPath[i].value);
					}
				}
			},

			endOfTurn: function() {
				if (this.turnNumber == this.maximumTurns) {
					this.endGame();
				}
				// score stuff?
			},

			startOfTurn: function() {
				this.turnNumber++;
				this.createNextTile();
				if (this.debug) console.log("Current Turn: ", this.turnNumber);
			},

			endGame: function() {
				let highest = -1;
				let winners = [];
				for (let i = 0; i < this.players.length; i++) {
					if (this.players[i].points > highest) {
						winners = [];
						winners.push(this.players[i]);
						highest = this.players[i].points;
					} else if (this.players[i].points == highest) {
						winners.push(this.players[i]);
					}
				}
				console.log(winners);
				alert("Game Over! Winner(s) are:");
			}

		});

		return Game;
	});
