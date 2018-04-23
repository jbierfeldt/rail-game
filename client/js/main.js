define(['jquery', 'app', 'game/game', 'game/board', 'game/player', 'game/tile', 'game/tests',
'app/gui'],
function($, App, Game, Board, Player, Tile, GameTests, GUI) {
	let app, game;

	const initApp = function() {
		// initializes the App

		$(document).ready(function() {
			app = new App();
			// init Game after App
			app.initGame();
			// GameTests.testGame(app);
		});
	};

	initApp();
});
