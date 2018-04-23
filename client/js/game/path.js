define(function() {

	// private static
	let nextId = 1;

	const Path = Class.extend({

		init: function() {
			this.id = nextId++;

			this.nodesOnPath = [];
      this.completedBy = null; // playerId of player who played Tile
		},

    getProperties: function() {

    }

	});

	return Path;
});
