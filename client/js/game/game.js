define(['game/board', 'game/player', 'game/tile'], function(Board, Player, Tile) {

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
			// calculates the value of a completed path
			// for the various players
			if (this.debug) console.log("Calculating Path Score...", path);

			const scoringObject = {};

			// create 'bucket' for each player
			for (let i = 0; i < this.players.length; i++) {
				scoringObject[this.players[i].id] = {
					nodes: []
				};
			}

			// sort path nodes into buckets
			for (let i = 0; i < path.nodesOnPath.length; i++) {
				if (path.nodesOnPath[i].playedBy) {
					scoringObject[path.nodesOnPath[i].playedBy].nodes.push(path.nodesOnPath[i]);
				}
			}

			// winnersArray will contain the ids of the player(s)
			// who have the most tiles in the completed path
			let longest = -1;
			let winnersArray = [];
			Object.keys(scoringObject).forEach(function(key) {
				if (scoringObject[key].nodes.length > longest) {
					winnerArray = []; // clear array
					longest = scoringObject[key].nodes.length; // current length is new longest
					winnerArray.push(Number(key));
				} else if (scoringObject[key].nodes.length == longest) {
					winnerArray.push(Number(key));
				}
			});
			if (this.debug) console.log(scoringObject, 'winners', winnerArray);

			// give players points based on their scoringObject
			// with a different multiplier for the winner
			for (let i = 0; i < this.players.length; i++) {
				let points = scoringObject[this.players[i].id].nodes.length;
				if (isInArray(this.players[i].id, winnerArray)) {
					const multiplier = 1 + (1/winnerArray.length);
					if (this.debug) console.log('multiplier for winner(s): ', multiplier);
					points = Math.round(points * multiplier);
				}
				this.players[i].addPoints(points);
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
