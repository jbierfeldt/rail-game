define(['app/input'], function(InputManager) {

	const GUI = Class.extend({

    init: function(app, game) {
      this.app = app;
      this.game = game;
			this.debug = this.app.debug;

      this.gameGridContainer = "#game-grid-layer";
			this.playerInfoContainer = "#player-info-container";
			this.nextTileContainer = "#next-tile-container";
			this.debugButtonContainer = "#debug-button-container";
			this.gameMask = "#game-mask";

			this.submitButton = "#submit-button";

			this.nextTileElement = null;

			this.gridTiles = [];

			this.debugButtons = {
				'New Game': function() {
					this.app.initGame();
				},
				'New Tile': function() {
					this.game.createNextTile();
					this.drawNextTile();
				},
				'Save Game': function() {
					console.log("saving game...");
					console.log(this.game.saveGame());
					if(localStorage) {
						localStorage.setItem('saveGame', JSON.stringify(this.game.saveGame()));
					}
				},
				'Load Game': function() {
					if (this.debug) console.log("loading game...");
					let json = JSON.parse(localStorage.getItem('saveGame'));
					this.game.loadGame(json);
					this.drawGrid();
					this.updateNextTile();
					this.updatePlayerInformation();
					//
				},
				'Rotate': this.rotateNextTile,
				'Add Tile to Board @': function() {
					let x = Number(prompt('x?')),
						y = Number(prompt('y?'));
					const boundfunc = this.game.board.addTileToBoard.bind(this.game.board);
					console.log(boundfunc(this.game.nextTile, x, y, this.game.getCurrentPlayerTurn().id));
					this.onEndOfTurn();
					this.onStartOfTurn();
				}
			};

			this.setup(game);
    },

    setup: function(game) {
			this.input = new InputManager(this, game);
			$(this.submitButton).click(this.onSubmit.bind(this));
			this.createPlayerStyleSheets();
    },

		createPlayerStyleSheets: function() {
			// Create the <style> tag
			var styleSheet = document.createElement("style");
			// WebKit hack :(
			styleSheet.appendChild(document.createTextNode(""));
			// Add the <style> element to the page
			document.head.appendChild(styleSheet);

			for (let i = 0; i < this.game.players.length; i++) {
				addCSSRule(document.styleSheets[1], ".player"+(this.game.players[i].id),
					"background-color:"+this.game.players[i].color+";");
				addCSSRule(document.styleSheets[1], ".player"+(this.game.players[i].id)+"-completed::after",
					"background:"+this.game.players[i].color+";", 1);
				addCSSRule(document.styleSheets[1], ".player"+(this.game.players[i].id)+"-marker::before",
					"background:"+this.game.players[i].color+";", 1);
			}
		},

		onSubmit: function() {
			if (this.debug) console.log("submitted!");
			if (this.nextTileElement.attr('data-grid_id')) {
				const dropzone = $("#"+this.nextTileElement.attr('data-grid_id'));
				const drop_x = Number(dropzone.attr('data-x'));
				const drop_y = Number(dropzone.attr('data-y'));
				this.sendTileToBoard(this.game.nextTile, drop_x, drop_y);
				this.onEndOfTurn();
				this.onStartOfTurn();
			}
		},

		sendTileToBoard: function(tile, x, y) {
			const boundfunc = this.game.board.addTileToBoard.bind(this.game.board);
			const currentPlayerId = this.game.getCurrentPlayerTurn().id;
			boundfunc(tile, x, y, currentPlayerId);
		},

		onStartOfTurn: function() {
			this.game.startOfTurn();
			this.drawGrid();
			this.drawNextTile();
			this.updatePlayerInformation();
		},

		onEndOfTurn: function() {
			this.game.endOfTurn();
		},

    drawGrid: function() {

			if (this.debug) {
				console.table(this.game.board.coordinates);
			}

			// clear
			$(this.gameGridContainer).empty();

      // parse through board coordinates
      // to draw grid and tiles
      let counter = 1;
      for (let i = 0; i < this.game.board.coordinates.length; i++) {

        // make a div for each row
        // and append to game grid
        const row = $('<div></div>', {
          class: 'row'
        }).appendTo(this.gameGridContainer);

        for (let j = 0; j < this.game.board.coordinates[i].length; j++) {

          // make a div for each coordinate
          // and append to each row
          const coordGrid = $('<div></div>', {
            id: 'grid-'+counter,
            class: 'square',
            'data-x': j,
            'data-y': i
          });

          // if coordinate is tile, give it class information
          // for proper display
          if (this.game.board.checkCoordIsTile(j, i)) {

            const tile = this.game.board.getTileAtCoord(j, i);

            coordGrid.addClass('tile-on-board');
            // class used for choosing sprite image
            coordGrid.addClass(tile.edges.join(''));
            // type Classes for factories, houses, and mines
            if (tile.type) {
              coordGrid.addClass(tile.type);
            }
            // player played-by badges
            if (tile.playedBy) {
              coordGrid.addClass('player-marker player'+tile.playedBy+'-marker');
            }

            // if coordinate is not a tile,
            // add classes for displaying empty grid
          } else {
            coordGrid.addClass('grid dropzone');
          }

          coordGrid.appendTo(row);
					this.gridTiles.push(coordGrid);
          // increment counter
          counter++;
        }
      }
    },

    drawPaths: function() {

    },

    rotateNextTile: function() {
			this.game.nextTile.rotateEdges();
			this.updateNextTile();
    },

    drawNextTile: function() {

			const nextTile = this.game.nextTile;

			$(this.nextTileContainer).empty();

			// make a div for each coordinate
			const nextTileGrid = $('<div></div>', {
				class: 'square next-tile',
				click: this.rotateNextTile.bind(this)
			});
			// class used for choosing sprite image
			nextTileGrid.addClass(nextTile.edges.join(''));
			// type Classes for factories, houses, and mines
			if (nextTile.type) {
				nextTileGrid.addClass(nextTile.type);
			}

			nextTileGrid.appendTo($(this.nextTileContainer));
			this.nextTileElement = nextTileGrid;

    },

		updateNextTile: function() {
			// clears current classes
			this.nextTileElement.removeClass();
			this.nextTileElement.addClass('square next-tile '+this.game.nextTile.edges.join(''));
			if (this.game.nextTile.type) {
				this.nextTileElement.addClass(this.game.nextTile.type);
			}
			if (this.nextTileElement.attr('data-grid_id')) {
				const dropzoneElement = document.getElementById(this.nextTileElement.attr('data-grid_id'));
				this.validateTilePlacement(this.game.nextTile, dropzoneElement, "drop");
			}
		},

    activateSubmitButton: function() {
			$(this.submitButton).prop('disabled', false);
    },

		deactivateSubmitButton: function() {
			$(this.submitButton).prop('disabled', true);
    },

    updatePlayerInformation: function() {

			$(this.playerInfoContainer).empty();

			for (let i = 0; i < this.game.players.length; i++) {

				let playerString = "Player "
				+ this.game.players[i].id
				+ ": "
				+ this.game.players[i].points;

				if (this.game.getCurrentPlayerTurn().id == this.game.players[i].id) {
					playerString = "*" + playerString;
				}

				const playerLabel = $('<div></div>', {
					class: 'player'+this.game.players[i].id,
					text: playerString
				});
				playerLabel.appendTo($(this.playerInfoContainer));
			}

    },

		drawButton: function(name, callback) {
			const newButton = $('<button></button>', {
				id: name+'-button',
				class: 'debug-button',
				text: name,
				click: callback.bind(this)
			}).appendTo(this.debugButtonContainer);
		},

    updateButtons: function() {
			const self = this;

			// if(this.debug) {
				// clear
				$(this.debugButtonContainer).empty();
				// add buttons for each of the defined debug buttons
				Object.keys(this.debugButtons).forEach(function (name) {
					self.drawButton(name, self.debugButtons[name]);
				});
			// }
    },

		// abstract function for running the validation function
		// from Board, and then adding the appropriate classes.
		// classType can either be set to "drop" or "drag",
		// depending on the type of classes which need to be added
		validateTilePlacement: function(tile, dropzone, classType) {
			const drop_x = Number(dropzone.dataset.x);
			const drop_y = Number(dropzone.dataset.y);

			//clear present classes
			dropzone.classList.remove('bad--catch', 'good--catch', 'can--catch', 'cannot--catch');

			if (this.game.board.checkValidPlacement(tile, drop_x, drop_y)) {
				if (classType == "drop") {
					dropzone.classList.add('good--catch');
					this.activateSubmitButton();
				} else if (classType == "drag") {
					dropzone.classList.add('can--catch');
				}
			} else {
				if (classType == "drop") {
					dropzone.classList.add('bad--catch');
					this.deactivateSubmitButton();
				} else if (classType == "drag") {
					dropzone.classList.add('cannot--catch');
				}
			}
		}

  });

	return GUI;
});
