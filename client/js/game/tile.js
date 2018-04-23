define(function() {

	// private static
	let nextId = 1;

	const Tile = Class.extend({

		init: function(type, edgesArray, playerId, startTile) {
			this.id = nextId++;

      this.type = type || null; // null, house, factory, mine
			this.edges = edgesArray || [];
      this.playedBy = playerId || null; // playerId of player who played Tile
      this.startTile = startTile || false;
		},

    setPlayedBy: function(playerId) {
      this.playedBy = playerId;
    },

    setEdges: function(edgeArray) {
      this.edges = edgeArray;
    },

    rotateEdges: function() {
      this.edges.unshift(this.edges.pop());
    },

    getProperties: function() {
      const propertiesObject = {
        edges: this.edges,
        type: this.type,
        playedBy: this.playedBy,
				startTile: this.startTile
      };
      return propertiesObject;
    }

	});

	return Tile;
});
