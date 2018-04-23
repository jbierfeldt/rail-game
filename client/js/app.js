// App is the application-layer responsible for handling all of the game logic external
// things, like input, server-sync, etc.

define(['game/game', 'app/gui', 'game/tile'], function(Game, GUI, Tile) {

	const App = Class.extend({

	    init: function() {
	        console.log("started App");
					this.debug = true;

					this.self = this;
					this.game = null;
					this.gui = null;

					this.options = null;
	    },

			initGame: function(options) {
				// initializes the Game

				var options = {};

		    // set dynamically in app
		    options.playerNum = 3;
		    options.playerColors = {
		      0: 'red',
		      1: 'orange',
		      2: 'blue'
		    };
		    options.boardSize = 15;
				options.maximumTurns = 50;

				this.game = new Game(this.self);
				this.game.setup(options);
				this.game.board.addStartTile();

				this.gui = new GUI(this.self, this.game);
				this.gui.onStartOfTurn();
				this.gui.updateButtons();
			}

	});
	return App;
});
