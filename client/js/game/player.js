define(function() {

	// private static
	let nextId = 1;

	const Player = Class.extend({

		init: function(color, points) {
			this.id = nextId++;

			this.points = points || 0;
			this.color = color || null;
		},

		resetNextId: function() {
			nextId = 1;
		},

    addPoints: function(int) {
      this.points += int;
    },

    getProperties: function() {
      const propertiesObject = {
        points: this.points,
        color: this.color
      };
      return propertiesObject;
    }

	});

	Player.resetNextId = function() {
		console.log("test");
	};

	return Player;
});
