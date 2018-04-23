var Tile = (function () {
	// private static
	
	// firstID and nextID must match
	var firstId = 1;
	var nextId = 1;
	
	// constructor
	var tileInstance = function () {
		// private
		var id = nextId++,
			pieces = [],
			// edge order by index is top, right, bottom, left
			edges = [],
			// can be of type undefined, 'house', 'factory', or 'mine'
			type = undefined,
			playedBy = undefined; // player object of player that played the tile
		
		// public (this instance only, created with new, access to private vars)
		this.get_id = function() {
			return id;
		};
		this.get_pieces = function () {
			return pieces;
		};
		this.get_edges = function () {
			return edges;
		};
		this.get_type = function () {
			return type;
		};
		this.get_playedBy = function () {
			return playedBy;
		};
		this.get_properties = function () {
			var properties_object = {
				pieces: pieces,
				edges: edges,
				type: type,
				playedBy: playedBy
			};
			return properties_object;
		};
		this.set_edges = function (edge_array) {
			edges = edge_array;
		};
		this.set_type = function (string) {
			type = string;
		};
		this.set_playedBy = function (int) {
			playedBy = int;
		};
		this.add_piece = function (name) {
			var piece = name;
			pieces.push(piece);
		};
		this.rotate_edges = function () {
			edges.unshift(edges.pop());
		};
				
	};
	
	// public static
	tileInstance.get_nextId = function () {
		return nextId;
	};
	tileInstance.create_tile_from_properties = function (tile_properties) {
		var newTile = new Tile;
		newTile.set_edges(tile_properties.edges);
		newTile.set_type(tile_properties.type);
		newTile.set_playedBy(tile_properties.playedBy);
		return newTile;
	};
	tileInstance.randomTile = function () {
		var newTile = new Tile,
			edgeChoices = ['g', 's'],
			typeChoices = [undefined, undefined, undefined, undefined, undefined,
				'factory', 'house', 'mine']; // implement weighted choice later
				
		// validate edges		
		var validEdges = false;
		while (validEdges == false) {
			var edges = [
				choose(edgeChoices),
				choose(edgeChoices),
				choose(edgeChoices),
				choose(edgeChoices)	
			];
			// if all four edges are the same, redo
			// all identical edges could cause impossible moves
			if (arrayIsIdent(edges)) {
				continue;
			} else {
				validEdges = true;
			}
		}
		
		newTile.set_edges(edges);
		newTile.set_type(choose(typeChoices));

		return newTile;
	};
	
	//public (shared across instances) 
	tileInstance.prototype = {
		check_is_starting_tile: function() {
			if (this.get_id() === firstId) {
				return true;
			} else {
				return false;
			}
		},
		check_surroundings: function () {
			console.log("The surrounding tiles are: ", this.get_edges());
		}
	};
	
	return tileInstance;
})();