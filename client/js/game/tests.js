define(['game/game', 'game/board', 'game/player', 'game/tile'], function(Game, Board, Player, Tile) {

  const testGame = function(app) {
    var options = {};

    // set dynamically in app
    options.playerNum = 3;
    options.playerColors = {
      0: 'red',
      1: 'green',
      2: 'blue'
    };
    options.boardSize = 15;

    console.log("\n########TESTS########")

    // setup game
    console.log("setup game");
    try {
      game = new Game(app);
      game.setup(options);
    } catch (e) {
      console.log(e);
    }

    // setup game
    console.log("create new player");
    try {
      game = new Game(app);
      game.setup(options);
      game.createNewPlayer("orange");
      console.log("true?", game.players.length === 4);
      console.log(game.players);
    } catch (e) {
      console.log(e);
    }

    // setup game
    console.log("create random tile");
    try {
      game = new Game(app);
      game.setup(options);
      game.createNextTile();
      console.log("next tile",game.nextTile);
    } catch (e) {
      console.log(e);
    }

    // check coord
    console.log("\n check if coord");
    try {
      game = new Game(app);
      game.setup(options);
      console.log("true?", game.board.checkCoordOnBoard(5, 5));
      console.log("false?", game.board.checkCoordOnBoard(-1, 0));
      console.log("false?", game.board.checkCoordOnBoard(20,20));
      console.log("false?", game.board.checkCoordOnBoard("q",20));
    } catch (e) {
      console.log(e);
    }

    // add start tile
    console.log("\n add start tile");
    try {
      game = new Game(app);
      game.setup(options);
      game.board.addStartTile();
    } catch (e) {
      console.log(e);
    }

    // check coord is Tile
    console.log("\n check if coord is tile");
    try {
      game = new Game(app);
      game.setup(options);
      game.board.addStartTile();
      console.log("true?", game.board.checkCoordIsTile(7, 7));
      console.log("false?", game.board.checkCoordIsTile(0,0));
    } catch (e) {
      console.log(e);
    }

    console.log("\n create invalid tile next to start // edge mismatch");
    try {
      game = new Game(app);
      game.setup(options);
      game.board.addStartTile();
      let newTile = new Tile(null, ['g','s','s','g']);
      game.board.addTileToBoard(newTile, 8, 7);
      console.log("false?", game.board.checkTileEdgeswithSurroundings(newTile, game.board.getCoordSurroundings(8, 7)));
      console.log("false?", game.board.checkValidPlacement(8,7));
    } catch (e) {
      console.log(e);
    }

    console.log("\n create invalid tile next to start // edge mismatch");
    try {
      game = new Game(app);
      game.setup(options);
      game.board.addStartTile();
      let newTile = new Tile(null, ['g','s','s','g']);
      game.board.addTileToBoard(newTile, 8, 7);
      console.log("false?", game.board.checkTileEdgeswithSurroundings(newTile, game.board.getCoordSurroundings(8, 7)));
    } catch (e) {
      console.log(e);
    }

    // create valid tile next to start
    console.log("\n create valid tile next to start");
    try {
      game = new Game(app);
      game.setup(options);
      game.board.addStartTile();
      let newTile = new Tile(null, ['g','s','s','s']);
      game.board.addTileToBoard(newTile, 8, 7);
      console.log("true?", game.board.checkTileEdgeswithSurroundings(newTile, game.board.getCoordSurroundings(8, 7)));
    } catch (e) {
      console.log(e);
    }

    // check valid placement
    console.log("\n check valid tile placements");
    try {
      game = new Game(app);
      game.setup(options);
      game.board.addStartTile();
      let newTile = new Tile(null, ['g','s','s','s']);
      let newTile2 = new Tile(null, ['g','g','g','g']);
      let newTile3 = new Tile(null, ['g','s','s','s']);
      game.board.addTileToBoard(newTile, 1, 0);
      game.board.addTileToBoard(newTile2, 8, 7);
      game.board.addTileToBoard(newTile3, 10, 7);
      console.log("false?", game.board.checkValidPlacement(newTile, -1,0)); // nothing there
      console.log("false?", game.board.checkValidPlacement(newTile, 1,0)); // no adjacent
      console.log("false?", game.board.checkValidPlacement(newTile2, 8,7)); // mismatch edges
      console.log("true?", game.board.checkValidPlacement(newTile3, 6,7)); // mismatch edges
    } catch (e) {
      console.log(e);
    }

    console.log("\n save/load game");
    try {
      game = new Game(app);
      game.setup(options);
      game.board.addStartTile();
      console.log(game.saveGame());
    } catch (e) {
      console.log(e);
    }

  };

  return {
    testGame: testGame
  };

});
