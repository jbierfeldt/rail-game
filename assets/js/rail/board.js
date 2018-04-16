var BoardView = (function () {
	// private static
	var nextId = 1;
	
	// constructor
	
	var boardViewInstance = function (initial_options, initial_context) {
		// private
		var id = nextId++;
		if (initial_context) {
			var context = initial_context;
		}
		if (initial_options) {
			var options = initial_options;
		}
		
		// public (this instance only)
		this.get_id = function () {
			return id;
		};
		this.rotate_next_tile = function (tileObj, tileElement) {
			tileObj.rotate_edges();
			this.draw_next_tile(tileObj, tileElement);
	
			// if already on the board, update the validity
			if (context.elements.nextSquare.dataset.grid_id) {
				this.check_valid_placement_add_classes(document.getElementById(context.elements.nextSquare.dataset.grid_id));
			}
		};
		this.draw_right_controls_layer = function () {
			var gameInfoRight = context.elements.gameInfoRight;
			
			// empty layer
			gameInfoRight.innerHTML = '';
			
			// submitBox
			var submitBox = document.createElement("button");
			context.elements.submitBox = submitBox;
			submitBox.id = "submit-box";
			submitBox.disabled = true;
			submitBox.innerHTML = "PRESS TO SUBMIT";
						
			(function(that) {
				submitBox.addEventListener("click", function() {
					if (context.elements.nextSquare.dataset.grid_id) {
						var placement_x = Number(document.getElementById(context.elements.nextSquare.dataset.grid_id).dataset.x);
						var placement_y = Number(document.getElementById(context.elements.nextSquare.dataset.grid_id).dataset.y);
						that.add_next_tile_at_coord(placement_x, placement_y); // calls refresh
					}
				});
			})(this);
			
			gameInfoRight.appendChild(submitBox);
			
			// player info box
			var playerBox = document.createElement("div");
			context.elements.playerBox = playerBox;
			playerBox.id = "player-box";
			
			var playersList = context.gameObj.get_players();
			
			for (var i = 0; i < playersList.length; i++) {
				var playerLabel = document.createElement("div");
				var playerString = 
					"Player "
					+ playersList[i].get_id()
					+ ": "
					+ playersList[i].get_totalPoints()
					+ "<br />";
				if (context.gameObj.get_playerCurrentTurn().get_id() == playersList[i].get_id()) {
					playerString = "*" + playerString;
				}
				playerLabel.innerHTML += playerString;
				playerLabel.classList.add('player'+playersList[i].get_id());
				playerBox.appendChild(playerLabel);
			}
	
			gameInfoRight.appendChild(playerBox);
		};
		this.draw_next_tile = function (tileObj, tileElement) {
			var nextTile = tileObj;
			var edges = nextTile.get_edges();
			let tileType = nextTile.get_type();
			var nextSquare = tileElement;
			
			nextSquare.classList = []; // clear current if updating
			
			nextSquare.classList.add('square', 'next-tile');
			nextSquare.classList.add(edges.join(''));
			
			// endPoints for factories, houses, and mines
			if (tileType) {
				nextSquare.classList.add(tileType);
			}
		};
		this.draw_next_tile_layer = function () {
			var nextTileContainer = context.elements.nextTileContainer;
			
			// empty layer
			nextTileContainer.innerHTML = '';
						
			var nextTile = context.gameObj.get_next_tile();
			var nextSquare = document.createElement("div");
			context.elements.nextSquare = nextSquare;
			nextSquare.id = "next-tile-square"
			
			this.draw_next_tile(nextTile, nextSquare);
			
			(function(that, nextTile, nextSquare) {
				nextSquare.addEventListener("click", function() {
					that.rotate_next_tile(nextTile, nextSquare);
				});
			})(this, nextTile, nextSquare);
			
			nextTileContainer.appendChild(nextSquare);
		};
		this.draw_button_layer = function () {
			var initGameBox = document.createElement("button");
			initGameBox.id = "init-box";
			initGameBox.innerHTML = "Initalize Game";
			
			(function() {
				initGameBox.addEventListener("click", function() {
					console.log("new Game");
					context.gameEngine.init();
				});
			})();
			
			context.elements.gameInfoLeft.append(initGameBox);
			
			var newTileBox = document.createElement("button");
			newTileBox.id = "newtile-box";
			newTileBox.innerHTML = "New Tile";
			
			(function(that) {
				newTileBox.addEventListener("click", function() {
					console.log("new Tile");
					context.gameObj.create_next_tile();
					that.render();
				});
			})(this);
			
			context.elements.gameInfoLeft.append(newTileBox);
			
			var saveBox = document.createElement("button");
			saveBox.id = "save-box";
			saveBox.innerHTML = "Save Game";
			
			(function() {
				saveBox.addEventListener("click", function() {
					console.log("saving game...");
					console.log(context.gameObj.save_game());
					localStorage.setItem('saveGame', JSON.stringify(context.gameObj.save_game()));
				});
			})();
			
			context.elements.gameInfoLeft.append(saveBox);
			
			var loadBox = document.createElement("button");
			loadBox.id = "load-box";
			loadBox.innerHTML = "Load Game";
			
			(function(that) {
				loadBox.addEventListener("click", function() {
					console.log("loading game...");
					if (localStorage.saveGame) {
						var load = localStorage.getItem('saveGame');
						context.gameObj.load_game(JSON.parse(load));
						that.render();
					}
				});
			})(this);
			
			context.elements.gameInfoLeft.append(loadBox);
		};
		this.draw_grid_layer = function () {
			var coords = context.gameObj.get_board().get_coordinates();
			var grid_layer = context.elements.gameGrid;
						
			// empty layer
			grid_layer.innerHTML = '';
			
			// parse through board coordinates
			// to draw grid and tiles
			var counter = 1;
			for (var i=0;i<coords.length;i++) {
				var row = document.createElement("div");
				row.className = "row";
				for (var j=0;j<coords[i].length;j++) {
					// for each 
					var square = document.createElement("div");
					square.id = "grid-" + counter; // unique id for lookup in the DOM
					square.classList.add('square');
					square.dataset.x = j; 
					square.dataset.y = i;
					
					// if coordinate is tile, display it properly
					if (context.gameObj.get_board().check_coord_is_tile(j, i)) {
						square.classList.add('tile-on-board');
						
						let t = coords[i][j];
						let tileType = t.get_type();
						
						// edges determine sprite selection
						var edges = t.get_edges();
						square.classList.add(edges.join(''));
						
						// endPoints for factories, houses, and mines
						if (tileType) {
							square.classList.add(tileType);
						}
						
						// player-marker badges
						if (t.get_playedBy()) {
							square.classList.add('player-marker', 'player'+t.get_playedBy()+'-marker');
						}
					
					// if coordinate is not a tile,
					// display empty grid			
					} else {
						context.elements.gridTiles.push(square);
						square.classList.add('grid', 'dropzone');
					}
								
					row.appendChild(square);
					counter++;
				}
				grid_layer.appendChild(row);
			}
		};
		this.draw_completed_paths = function () {
			var paths = context.gameObj.get_board().get_paths();
			for (var i = 0; i<paths.length; i++) {
				this.draw_completed_path(paths[i]);
			}
		};
		this.draw_completed_path = function(path) {
			for (var i = 0; i < path.coords.length; i++) {
				var tile_element = document.querySelectorAll("[data-x='" + path.coords[i][0] + "'][data-y='" + path.coords[i][1] + "']")
				tile_element[0].classList.add('completed');
			}
		};
		this.check_completed_path = function (x, y) {
			var status = context.gameObj.get_board().check_path_status(x, y);
			if (status.open_nodes.length === 0 && status.tiles.length > 0) {
				status.winner = context.gameObj.calc_completed_path_points(status);
				this.draw_completed_path(status); // maybe take out because redundant with next
				context.gameObj.get_board().add_path_to_board(status);
// 				console.log(context.gameObj.get_board().get_paths()); // show currently completed paths
				return true;
			} else {
				return false;
			}
		};
		this.add_next_tile_at_coord = function (x, y) {
			var nextTile = context.gameObj.get_next_tile();
			if (context.gameObj.get_board().check_valid_placement(nextTile, x, y)) {
				var player = context.gameObj.get_playerCurrentTurn();
				nextTile.set_playedBy(player.get_id()); // set who the tile was played by
				context.gameObj.get_board().add_tile_to_board(nextTile, x, y); // add to actual game 
				this.check_completed_path(x, y); // check if path was completed
				context.gameObj.next_turn(); // move to next turn ---- this logic should go elsewhere
				context.gameObj.create_next_tile(); // create next tile ---- should be moved to initialize turn logic
				this.render(); // better time to call this?
			} else {
				console.log("can't add next tile");
			}	
		};
		this.check_valid_placement_add_classes = function (dropzoneElement) {
			var nextTile = context.gameObj.get_next_tile();
			var drop_x = Number(dropzoneElement.dataset.x);
			var drop_y = Number(dropzoneElement.dataset.y);
			
			// clear present classes
			dropzoneElement.classList.remove('bad--catch', 'good--catch');
			
			// check tile placement's validity
			if (context.gameObj.get_board().check_valid_placement(nextTile, drop_x, drop_y)) {
				// feedback the possibility of a drop
				dropzoneElement.classList.add('good--catch');
				context.elements.submitBox.classList.add("active");
				context.elements.submitBox.disabled = false;
				canSubmit = true;
			} else {
				dropzoneElement.classList.add('bad--catch');
				context.elements.submitBox.classList.remove("active");
				context.elements.submitBox.disabled = true;
				canSubmit = false;
			}
		};
		this.isGridElementinView = function (grid_element) {
			// function which checks if grid element is 
			// in the bounds of the game mask. Used by 
			// gridDragEndListener to check whether the element 
			// should be set as a valid dropzone or not
			var grid_rect = grid_element.getBoundingClientRect();
			
			var mask_rect = context.elements.gameMask.getBoundingClientRect();
			console.log(grid_rect, mask_rect);
			
			return (
			    grid_rect.top >= mask_rect.top &&
			    grid_rect.left >= mask_rect.left &&
			    grid_rect.bottom <= mask_rect.bottom &&
			    grid_rect.right <= mask_rect.right
			);
		};
		this.move_camera_to_start = function () {
			var boardSize = options.boardSize;
			var boardPxSize_x = boardSize * (6 + 64);
			var boardPxSize_y = boardSize * (10 + 64);
			mask_width = context.elements.gameMask.getBoundingClientRect().width;
			mask_height = context.elements.gameMask.getBoundingClientRect().height;
			displace_x = ((Math.floor(boardSize / 2) * (6 + 64)) - (mask_width / 2) + 44);
			displace_y = ((Math.floor(boardSize / 2) * (10 + 64)) - (mask_height / 2) + 42);
			
			context.elements.gameGrid.style.webkitTransform =
			context.elements.gameGrid.style.transform =
			//'translate(' + -(boardPxSize / 10) + 'px, ' + -(boardPxSize / 10) + 'px)';
			'translate(' + -displace_x + 'px, ' + -displace_y + 'px)';
			context.elements.gameGrid.setAttribute('data-x', -displace_x);
			context.elements.gameGrid.setAttribute('data-y', -displace_y);
		};
		this.create_player_style_sheet = function () {
			// Create the <style> tag
			var style = document.createElement("style");
			
			// WebKit hack :(
			style.appendChild(document.createTextNode(""));
			
			// Add the <style> element to the page
			document.head.appendChild(style);
			
			context.style_sheet = style.sheet;
			
			playersList = context.gameObj.get_players();
						
 			var player_combinations = combinations(playersList.map(x => x.get_id()));
 			
 			for (var i = 0; i < player_combinations.length; i++) {
	 			if (player_combinations[i].length > 1) {
		 			var classString = '.players';
		 			var styleString = 'background: repeating-linear-gradient(to left top, ';
		 			for (var j = 0; j < player_combinations[i].length; j++) {
			 			classString += (player_combinations[i][j] + '-');
			 			styleString += "rgba("
		 				+playersList[j].get_colorRGBList()[0]+","
		 				+playersList[j].get_colorRGBList()[1]+","
		 				+playersList[j].get_colorRGBList()[2]+",.6), "
	 				}
	 				classString += 'completed::after';
	 				styleString = styleString.substring(0, styleString.length - 2);
	 				styleString += ')';
	 				addCSSRule(context.style_sheet, classString, styleString);
	 			}
 			}
						
			for (var i = 0; i < playersList.length; i++) {
				newPlayerColor = playersList[i].get_colorRGBList();
				addCSSRule(context.style_sheet, ".player"+(playersList[i].get_id()),
					"background-color: rgb("+newPlayerColor[0]+","+newPlayerColor[1]+","+newPlayerColor[2]+")");
				addCSSRule(context.style_sheet, ".player"+(playersList[i].get_id()+"-completed::after"),
					"background: rgba("+newPlayerColor[0]+","+newPlayerColor[1]+","+newPlayerColor[2]+", .6)", 1);
				addCSSRule(context.style_sheet, ".player"+(playersList[i].get_id()+"-marker::before"),
					"background: rgb("+newPlayerColor[0]+","+newPlayerColor[1]+","+newPlayerColor[2]+")", 1);
			}
			
			
		};
		this.render = function () {
			console.log('rendering boardView');
			this.draw_grid_layer();
			this.draw_completed_paths();
			this.draw_next_tile_layer();
			this.draw_right_controls_layer();
		};
		this.init = function () {
			context.boardView = this;
			
			context.elements.gameInfoLeft = document.createElement("div")
			context.elements.gameInfoLeft.id = "game-info-left";
			options.canvas.appendChild(context.elements.gameInfoLeft);
			
			context.elements.nextTileContainer = document.createElement("div")
			context.elements.nextTileContainer.id = "next-tile-container";
			context.elements.gameInfoLeft.appendChild(context.elements.nextTileContainer);
			
			context.elements.gameMask = document.createElement("div");
			context.elements.gameMask.id = "game-mask";
			options.canvas.appendChild(context.elements.gameMask);
			
			context.elements.gameGrid = document.createElement("div");
			context.elements.gameGrid.id = "game-grid";
			context.elements.gameMask.appendChild(context.elements.gameGrid);
			
			context.elements.gameInfoRight = document.createElement("div");
			context.elements.gameInfoRight.id = "game-info-right";
			options.canvas.appendChild(context.elements.gameInfoRight);
			
			context.elements.gridTiles = [];
	
			this.create_player_style_sheet();
			
			context.gameObj.get_board().add_start_tile_to_board();
			
			this.move_camera_to_start();
			
			context.input = new DesktopInput(context);
			
			context.input.draw_button_layer();
			context.input.init_interact_layer();
		};
		
		this.init();
	
	};
	
	// public static
	boardViewInstance.get_nextId = function () {
		return nextId;
	};
	
	return boardViewInstance;
})();
