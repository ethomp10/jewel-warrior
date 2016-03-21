match3.board = (function() {
	var settings,
		jewels,
		cols,
		rows,
		baseScore,
		numJewelTypes;
		
	function initialize(callback) {
		settings = match3.settings;
		numJewelTypes = settings.numJewelTypes;
		baseScore = settings.baseScore;
		cols = settings.cols;
		rows = settings.rows;
		fillBoard();
		if (callback) {
			callback();
		}
	}
	
	function fillBoard() {
		var x, y, type;
		
		jewels = [];
		for (x = 0; x < cols; x++) {
			jewels[x] = [];
			for (y = 0; y < rows; y++) {
				type = randomJewel();
				while ((type === getJewel(x-1, y) &&
						type === getJewel(x-2, y)) ||
						(type === getJewel(x, y-1) &&
						type === getJewel(x, y-2))) {
					type = randomJewel();
				}
				jewels[x][y] = type;
			}
		}
	}
	
	function randomJewel() {
		return Math.floor(Math.random() * numJewelTypes);
	}
	
	function getJewel(x, y) {
		if (x < 0 || x > cols-1 || y < 0 || y > rows-1) {
			return -1;
		} else {
			return jewels[x][y];
		}
	}
	
	function print() {
		var str = "";
		for (var y = 0; y < rows; y++) {
			for (var x = 0; x < cols; x++) {
				str += getJewel(x, y) + " ";
			}
			str += "\r\n";
		}
		console.log(str);
	}
	
	return {
		initialize: initialize,
		print: print
	};
})();
