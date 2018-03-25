var game_options = {
	canvas: document.getElementById("game-wrapper"),
	scenes: {
	},
	currentScene: undefined,
	boardSize: 18,
	tileSize: 64, // size of tiles being used in px
	num_of_players: 4
};

var GameEngine = (function () {
	// private static
	var nextId = 1;
	
	// constructor
	
	var __constructor = function (options) {
		// private
		var id = nextId++;
		var viewStack = [];
		var scenes = {};
		var currentScene = undefined;
		var options = options;
		var context = {};
		
		// public (this instance only)
		this.get_id = function () {
			return id;
		};
		this.get_scenes = function () {
			return scenes;
		};
		this.get_views = function () {
			return viewStack;
		};
		this.get_context = function () {
			return context;
		};
		this.render = function () {
			// requestAnimFrame
			for (var i = 0; i<viewStack.length; i++) {
				viewStack[i].render();
        	}		
		};
		this.add_scene = function (name, sceneInstance) {
			scenes[name] = sceneInstance;
		};
		this.transition_to_scene = function (nextScene) {
			if (currentScene) {
				// leave the current scen
				currentScene.on_leave();
			}
			
			currentScene = scenes[nextScene];
			
			viewStack = []; // clear current viewStack
			for (var i = 0; i < currentScene.get_views().length; i++) {
				viewStack.push(currentScene.get_views()[i]);
			}
			
			currentScene.set_context(context);
			currentScene.on_enter();
		};
		this.create_new_board = function (options) {
			console.log("creating new board");
			var newBoard = context['gameObject'].create_board(options['boardSize']);
			context['boardObject'] = newBoard;
						
			var newBoardScene = new BoardScene(options, context);
			this.add_scene('board', newBoardScene);
			this.transition_to_scene('board', context);
		};
		this.init = function () {
			if (options.scenes) {
				scenes = options.scenes;
			}
			if (options.currentScene) {
				this.transition_to_scene(options.currentScene);
			}
			context.gameEngine = this;
			context.gameObj = new Game();
			options.canvas.innerHTML = '';
			context.elements = {};
			console.log("engine started");
			this.add_scene('main', new MainScene(options, context));
			this.transition_to_scene('main');
			this.render();
		};
		
		this.init();
		
	};
	
	// public static
	__constructor.get_nextId = function () {
		return nextId;
	};
	
	return __constructor;
})();

var MainScene = (function () {
	// private static
	var nextId = 1;
	
	// constructor
	
	var __constructor = function (initial_options, initial_context) {
		// private
		var id = nextId++;
		var viewStack = [];
		var context = {};
		if (initial_context) {
			var context = initial_context;
// 			var boardObject = initial_context['boardObject'];
		}
		if (initial_options) {
			var options = initial_options;
		}
		
		// public (this instance only)
		this.get_id = function () {
			return id;
		};
		this.get_views = function () {
			return viewStack;
		};
		this.get_context = function () {
			return context;
		};
		this.set_context = function (new_context) {
			context = new_context;
		};
			this.on_leave = function () {
			console.log("leaving Main Scene");
		};
		this.on_enter = function () {
			console.log("entering Main Scene");
		};
		this.init = function () {
			context.boardObj = context.gameObj.create_board(options['boardSize']);
			for (var i = 0; i < options.num_of_players; i++) {
				var newPlayer = context.gameObj.create_new_player();
				var newPlayerColor = getRandomRBG();
				newPlayer.set_colorRGBList(newPlayerColor);
			}
			var grid = new BoardView(options, context);
			viewStack.push(grid);
		};
		
		this.init();
	};
	
	// public static
	__constructor.get_nextId = function () {
		return nextId;
	};
	
	return __constructor;
})();

var BoardView = (function () {
	// private static
	var nextId = 1;
	
	// constructor
	
	var __constructor = function (initial_options, initial_context) {
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
			var isEndPoint = nextTile.get_isEndPoint();
			var nextSquare = tileElement;
			
			nextSquare.classList = []; // clear current if updating
			
			nextSquare.classList.add('square', 'next-tile');
			nextSquare.classList.add(edges.join(''));
			
			// endPoints for factories, houses, and mines
			if (nextTile.get_isEndPoint()) {
				//
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
					localStorage.setItem('boardSave', JSON.stringify(context.gameObj.save_board()));
				});
			})();
			
			context.elements.gameInfoLeft.append(saveBox);
			
			var loadBox = document.createElement("button");
			loadBox.id = "load-box";
			loadBox.innerHTML = "Load Game";
			
			(function(that) {
				loadBox.addEventListener("click", function() {
					console.log("loading game...");
					if (localStorage.boardSave) {
						var load = localStorage.getItem('boardSave');
						context.gameObj.load_board(JSON.parse(load));
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
						
						var t = coords[i][j];
						
						// edges determine sprite selection
						var edges = t.get_edges();
						square.classList.add(edges.join(''));
						
						// endPoints for factories, houses, and mines
						if (t.get_isEndPoint()) {
							//
						}
						
						// player-marker badges
						if (t.get_playedBy()) {
							square.classList.add('player-marker', 'player'+t.get_playedBy()+'-marker');
						}
					
					// if coordinate is not a tile,
					// display empty grid			
					} else {
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
				tile_element[0].classList.add('player'+path.player_completed+'-completed', 'completed');
			}
		};
		this.check_completed_path = function (x, y) {
			var status = context.gameObj.get_board().check_path_status(x, y);
			console.log(status);
			if (status.open_nodes.length === 0 && status.tiles.length > 0) {
				var player = context.gameObj.get_playerCurrentTurn();
				status.player_completed = player.get_id();
				this.draw_completed_path(status); // maybe take out because redundant with next
				context.gameObj.get_board().add_path_to_board(status);
				console.log(context.gameObj.get_board().get_paths()); // show currently completed paths
				this.compute_score_for_completed_path(status);
				return true;
			} else {
				return false;
			}
		};
		this.compute_score_for_completed_path = function (completed_path) {
			// to be moved into the Game logic
			var player = context.gameObj.get_playerCurrentTurn();
			console.log(player.get_id());
			player.add_points(completed_path.tiles.length);
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
		this.init_interact_layer = function () {
			var startPos = undefined;
			var moveContainer = [];
			var canSubmit = false;
			
			interact('.next-tile').draggable({
				snap: {
					targets: [startPos],
					range: Infinity,
					relativePoints: [{x: 0.5, y: 0.5 }],
					endOnly: true
				},
				onstart: function (event) {
					var rect = interact.getElementRect(event.target);
					
					event.target.parentNode.appendChild(event.target);
					
					// record center point when starting the very first a drag
					startPos = {
			        	x: rect.left + rect.width  / 2,
						y: rect.top  + rect.height / 2
					};
					
					event.interactable.draggable({
						snap: {
							targets: [startPos]
						}
					});
					
				},
				onmove: dragMoveListener,
				onend: dragEndListener
			});
			
			interact('.dropzone').dropzone({
				accept: '.next-tile',
				
				ondropactivate: function (event) {
					event.target.classList.add('can--drop');
					event.target.classList.remove('bad--catch', 'good--catch');
				},
				ondragenter: function (event) {
					var draggableElement = event.relatedTarget,
					dropzoneElement = event.target,
					dropRect = interact.getElementRect(dropzoneElement),		
					dropCenter = {
						x: dropRect.left + dropRect.width / 2,
						y: dropRect.top + dropRect.height / 2
					},
					nextTile = context.gameObj.get_next_tile();
					
					event.draggable.draggable({
						snap: {
							targets: [dropCenter]
						}
					});
					
					dragValidPlacementAddClasses(draggableElement, dropzoneElement);
					
				},
				ondragleave: function (event) {
				    // remove the drop feedback style
				    event.target.classList.remove('can--catch', 'caught--it', 'cannot--catch');
				    event.relatedTarget.classList.remove('drop--me');
				},
				ondrop: function (event) {
			    	var nextTile = context.gameObj.get_next_tile(),
			    	x = Number(event.target.dataset.x),
			    	y = Number(event.target.dataset.y);
			    	
			    	dropValidPlacementAddClasses(event.relatedTarget, event.target);
			    	//console.log("this:", event.relatedTarget, "got dropped:", event.target.dataset);
					event.relatedTarget.dataset.grid_id = event.target.id;
					addToMoveContainer(event.relatedTarget);
				}
			});
			
			interact('#'+context.elements.gameGrid.id).draggable({
				// enable inertial throwing
				inertia: true,
				// keep the element within the area
				restrict: {
			   	  //restriction: {top: -(boardPxSize-250), left: -(boardPxSize-250), bottom: (boardPxSize+500), right: (boardPxSize)},
				  endOnly: true,
				  elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
				},
				
				onmove: dragMoveListenerWithMoveContainer,
				onend: dragEndListener
			});
			
			function dragValidPlacementAddClasses (draggableElement, dropzoneElement) {
				var nextTile = context.gameObj.get_next_tile();
				var drop_x = Number(dropzoneElement.dataset.x);
				var drop_y = Number(dropzoneElement.dataset.y);
				
				// check tile placement's validity
				if (context.gameObj.get_board().check_valid_placement(nextTile, drop_x, drop_y)) {
					// feedback the possibility of a drop
					dropzoneElement.classList.add('can--catch');
					draggableElement.classList.add('drop--me');
				} else {
					dropzoneElement.classList.add('cannot--catch');
				}
			};
			
			function dropValidPlacementAddClasses (draggableElement, dropzoneElement) {
				//console.log(draggableElement, dropzoneElement);
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
			
			function addToMoveContainer (object) {
				// don't add object to moveContainer if it's already in
				if (moveContainer.includes(event.target)) {
					null
				} else {
					moveContainer.push(object);
				}
			};
			
			function dragMoveListener (event) {
				var target = event.target,
				// keep the dragged position in the data-x/data-y attributes
				x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
				y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
				
				// translate the element
				target.style.webkitTransform =
				target.style.transform =
				    'translate(' + x + 'px, ' + y + 'px)';
				    
				// update the posiion attributes
				target.setAttribute('data-x', x);
				target.setAttribute('data-y', y);
				target.classList.add('getting--dragged');
			};
			
			function dragMoveListenerWithMoveContainer (event) {
				var target = event.target,
				// keep the dragged position in the data-x/data-y attributes
				x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
				y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
				
				// translate the element
				target.style.webkitTransform =
				target.style.transform =
				    'translate(' + x + 'px, ' + y + 'px)';
				    
				// update the posiion attributes
				target.setAttribute('data-x', x);
				target.setAttribute('data-y', y);
				target.classList.add('getting--dragged');
				
				// move what's in the moveContainer as well
				for (var i=0;i<moveContainer.length;i++) {
					var target = moveContainer[i],
					// keep the dragged position in the data-x/data-y attributes
					x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
					y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
					
					// translate the element
					target.style.webkitTransform =
					target.style.transform =
					    'translate(' + x + 'px, ' + y + 'px)';
					    
					// update the positon attributes
					target.setAttribute('data-x', x);
					target.setAttribute('data-y', y);
					target.classList.add('getting--dragged');
				}
			};
			
			function dragEndListener (event) {
				event.target.classList.remove('getting--dragged');
			};
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
			
			for (var i = 0, playersList = context.gameObj.get_players(); i < playersList.length; i++) {
				newPlayerColor = playersList[i].get_colorRGBList();
				addCSSRule(context.style_sheet, ".player"+(playersList[i].get_id()),
					"background-color: rgb("+newPlayerColor[0]+","+newPlayerColor[1]+","+newPlayerColor[2]+")");
				addCSSRule(context.style_sheet, ".player"+(playersList[i].get_id()+"-completed::after"),
					"background: rgba("+newPlayerColor[0]+","+newPlayerColor[1]+","+newPlayerColor[2]+", .45)", 1);
				addCSSRule(context.style_sheet, ".player"+(playersList[i].get_id()+"-marker::before"),
					"background: rgb("+newPlayerColor[0]+","+newPlayerColor[1]+","+newPlayerColor[2]+")", 1);
			}
		};
		this.render = function () {
			console.log('rendering boardView')
			this.draw_grid_layer();
			this.draw_completed_paths();
			this.draw_next_tile_layer();
			this.draw_right_controls_layer();
		};
		this.init = function () {
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
			
			this.draw_button_layer();
			
			this.init_interact_layer();
			
			this.create_player_style_sheet();
			
			context.gameObj.get_board().add_start_tile_to_board();
			
			this.move_camera_to_start();
		};
		
		this.init();
	};
	
	// public static
	__constructor.get_nextId = function () {
		return nextId;
	};
	
	return __constructor;
})();


GAME = new GameEngine(game_options);