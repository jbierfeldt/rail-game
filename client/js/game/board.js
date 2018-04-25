define(['game/tile', 'game/path'], function(Tile, Path) {

  // private static
  let nextId = 1;

  const Board = Class.extend({

    init: function(game, size) {
      this.id = nextId++;
      this.size = size;
      this.game = game;
      this.debug = game.app.debug;

      this.coordinates = create2DArray(size); // 2D array
      this.tiles = []; // array of tiles currently on board
      this.paths = []; // array of paths currently on board
    },

    setup: function(options) {
      // fill out coordinates with 2d array from options
      this.options = options || {};
    },

    // returns true if given coords are valid on the board
    checkCoordOnBoard: function(x, y) {
      try {
        if (this.coordinates[y][x] !== undefined) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    },

    // returns true if given coords are a tile
    checkCoordIsTile: function(x, y) {
      if (this.checkCoordOnBoard(x, y)) {
        return this.coordinates[y][x] instanceof Tile;
      } else {
        return false;
      }
    },

    // returns true if given edges may legally border
    checkValidEdges: function(edge1, edge2) {
      if (edge1 === edge2 || edge2 === undefined) {
        return true;
      } else {
        return false;
      }
    },

    // returns true if given tile and surroundings are valid
    checkTileEdgeswithSurroundings: function(tile, surroundings) {
      for (let i = 0, length = surroundings.length; i < length; i++) {
        if (surroundings[i]) {
          if (this.checkValidEdges(
            tile.edges[i],
            surroundings[i].edges[(i+2)%length]
          ) == false) { return false };
        }
      }
      return true;
    },

    // returns true if whatever is at given coords
    // is a valid placement
    checkValidPlacement: function(tile, x, y) {

      const surroundings = this.getCoordSurroundings(x, y);

      // if non-valid coord or if tile is already there, false
      if (this.checkCoordIsTile(x,y)) { return false };

      // if coord has no adjacent tiles and is not starting tile
      if (surroundings.every(function(i){ if(!(i instanceof Tile)) {return true}})
      & ! tile.startTile) { return false };

      // if edges don't match with surroundings, false
      if (!this.checkTileEdgeswithSurroundings(tile, surroundings)) {return false }

      // if everything passes
      return true;
    },

    getPathStatus: function(x, y) {
      if (this.debug) console.log("getting path status");
      // function which checks the status the path on which
      // the given coordinates lie
      // returns path object
      const self = this;
      const tilesOnPath = []; // used to prevent re-processing
      const nodesOnPath = []; // nodes are
      const openNodes = [];
      const deltaX = [0, 1, 0, -1]
      const deltaY = [-1, 0, +1, 0]

      // recursive function which walks the path
      // skip_direction prevents the walk pointer from
      // going back down the same path twice
      function walk(self, x, y) {
        let currentTile = self.getTileAtCoord(x, y),
            currentNode = {},
            nextNode = null;

        // register the current cord and info
        tilesOnPath.push(currentTile);
        Object.assign(currentNode, {
          id:currentTile.id,
          type:currentTile.type,
          playedBy:currentTile.playedBy,
          x:x,
          y:y,
          neighbors: []
        });
        nodesOnPath.push(currentNode);

        for (let i = 0; i < 4; i++) { // check all four directions
          // if edge is a path and isn't the edge
          // of the previous tile
          if (currentTile.edges[i] === 's') {
            let newX = x + deltaX[i],
            newY = y + deltaY[i];
            nextNode = self.getTileAtCoord(newX, newY);
            if (nextNode instanceof Tile) {
              currentNode.neighbors.push(nextNode.id);
              if (tilesOnPath.indexOf(nextNode) === -1) {
                walk(self, newX, newY);
              }
            } else if (nextNode === 0) {
              openNodes.push(currentNode);
            }
          }
        }
      };

      // start walking
      walk(self,x,y);

      return {openNodes, nodesOnPath};
    },

    checkPathComplete: function() {

    },

    // gets surroundings of coord
    // returns 4-element array of Tiles or undefineds
    getCoordSurroundings: function(x, y) {
      let surroundings = [];

      try {
        surroundings.push(this.coordinates[y-1][x]);
      } catch (e) {
        surroundings.push(undefined);
      }
      try {
        surroundings.push(this.coordinates[y][x+1]);
      } catch (e) {
        surroundings.push(undefined);
      }
      try {
        surroundings.push(this.coordinates[y+1][x]);
      } catch (e) {
        surroundings.push(undefined);
      }
      try {
        surroundings.push(this.coordinates[y][x-1]);
      } catch (e) {
        surroundings.push(undefined);
      }

      return surroundings;
    },

    getTileAtCoord: function(x, y) {
      try {
        return this.coordinates[y][x];
      } catch (e) {
        return undefined;
      }
    },

    addTileToBoard: function(tile, x, y, playerId) {
      if (this.checkValidPlacement(tile, x, y)) {
        if (playerId) {
          tile.playedBy = playerId;
        }
        this.coordinates[y][x] = tile;
        this.tiles.push(tile);
        const pathStatus = this.getPathStatus(x, y);
        if (this.debug) console.log(pathStatus);
        if (pathStatus.openNodes.length == 0 && pathStatus.nodesOnPath.length > 0) {
          this.addPathToBoard(pathStatus);
        };
        return true;
      } else {
        return false;
      }
    },

    addStartTile: function() {
      const startTile = new Tile();
      startTile.setEdges(['g', 's', 'g', 's']);
      startTile.startTile = true;
      this.coordinates[Math.floor(this.size / 2)][Math.floor(this.size / 2)] = startTile;
    },

    addPathToBoard: function(path) {
      if (this.debug) console.log("adding path to board", path);
      this.game.calcCompletedPathScore(path);
      this.paths.push(path);
    },

    // debug methods

    getProperties: function() {
      const boardProperties = {
        size: this.size,
        TileNum: this.tiles.length,
        paths: this.paths,
        tiles: []
      };
      let counter = 0;
      for (let i = 0; i < this.coordinates.length; i++) {
        for (let j = 0; j < this.coordinates[i].length; j++) {
          let coordContent = this.coordinates[i][j];
          if (coordContent instanceof Tile) {
            coordContent = coordContent.getProperties();
            boardProperties.tiles.push({
              x: j,
              y: i,
              tileProperties: coordContent
            });
            counter++;
          }
        }
      }
      return boardProperties;
    }

  });

  return Board;
});
