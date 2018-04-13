var game_options = {
	canvas: document.getElementById("game-wrapper"),
	scenes: {
	},
	currentScene: undefined,
	boardSize: 18,
	tileSize: 64, // size of tiles being used in px
	num_of_players: 2
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
			// create board
			context.gameObj.create_board(options['boardSize']);
			Player.reset_nextId(); // Player_id always starts at 1
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

GAME = new GameEngine(game_options);