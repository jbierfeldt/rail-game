var Player = (function () {
	// private static
	var nextId = 1;
	
	// constructor
	
	var playerInstance = function () {
		// private
		var id = nextId++;
		var totalPoints = 0;
		var colorRGBList = [];

		// public (this instance only)
		this.get_id = function () {
			return id;
		};
		this.get_totalPoints = function () {
			return totalPoints;
		};
		this.get_colorRGBList = function () {
			return colorRGBList;
		};
		this.get_properties = function () {
			var properties_object = {
				totalPoints: totalPoints,
				colorRGBList: colorRGBList
			};
			return properties_object;
		};
		this.set_totalPoints = function (int) {
			totalPoints = int;
		};
		this.set_colorRGBList = function (list) {
			colorRGBList = list;
		};
		this.add_points = function (points_amt) {
			totalPoints += points_amt;
			return totalPoints;
		};

	};
	
	// public static
	playerInstance.create_player_from_properties = function (player_properties) {
		var newPlayer = new Player;
		newPlayer.set_totalPoints(player_properties.totalPoints);
		newPlayer.set_colorRGBList(player_properties.colorRGBList);
		return newPlayer;
	};
	playerInstance.get_nextId = function () {
		return nextId;
	};
	playerInstance.reset_nextId = function () {
		nextId = 1;
	};
	
	return playerInstance;
})();