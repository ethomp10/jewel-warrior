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
		
		// Try again if new board has no moves
		if (!hasMoves()) {
			fillBoard();
		}
	}
	
	// Swap (x1, y1) with (x2, y2) if possible
	function swap(x1, y1, x2, y2, callback) {
		var tmp, events;
		
		if (canSwap(x1, y1, x2, y2)) {
			// Swap the jewels
			tmp = getJewel(x1, y1);
			jewels[x1][y1] = getJewel(x2, y2);
			jewels[x2][y2] = tmp;
			
			// Check board and get event list
			events = check();
			callback(events);
		} else {
			callback(false);
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
	
	// Returns # of jewels in longest chain that includes (x, y)
	function checkChain(x, y) {
		var type = getJewel(x, y),
			left = 0, right = 0,
			down = 0, up = 0;
		// Look right
		while (type === getJewel(x + right + 1, y)) {
			right++;
		}
		// Look left
		while (type ===  getJewel(x - left - 1, y)) {
			left++;
		}
		// Look up
		while (type === getJewel(x, y + up + 1)) {
			up++;
		}
		// Look down
		while (type === getJewel(x, y - down - 1)) {
			down++;
		}
		return Math.max(left + 1 + right, up + 1 + down);
	}
	
	// Returns true if (x1, y1) can be swapped with (x2, y2)
	function canSwap(x1, y1, x2, y2) {
		var type1 = getJewel(x1, y1),
			type2 = getJewel(x2, y2),
			chain;
		
		if (!isAdjacent(x1, y1, x2, y2)) {
			return false;
		}
		
		// Temporarily swap jewels
		jewels[x1][y1] = type2;
		jewels[x2][y2] = type1;
		
		chain = (checkChain(x2, y2) > 2 || checkChain(x1, y1) > 2);
		
		// Swap back
		jewels[x1][y1] = type1;
		jewels[x2][y2] = type2;
		
		return chain;
	}
	
	// Returns true if (x1, y1) is adjacent to (x2, y2)
	function isAdjacent(x1, y1, x2, y2) {
		var dX = Math.abs(x1 - x2),
			dY = Math.abs(y1 - y2);
		return (dX + dY === 1);
	}
	
	// Returns a 2D map of chain-lengths
	function getChains() {
		var x, y, chains = [];
		
		for (x = 0; x < cols; x++) {
			chains[x] = [];
			for (y = 0; y < rows; y++) {
				chains[x][y] = checkChain(x, y);
			}
		}
		return chains;
	}
	
	function check(events) {
		var chains = getChains(), hadChains = false,
			removed = [], moved = [], gaps = [],
			score = 0, x, y;
		
		for (var x = 0; x < cols; x++) {
			gaps[x] = 0;
			for (var y = rows-1; y >= 0; y--) {
				if (chains[x][y] > 2) {
					hadChains = true;
					gaps[x]++;
					removed.push({
						x: x, y: y,
						type: getJewel(x, y)
					});
					
					// Add points
					score += baseScore * Math.pow(2, (chains[x][y] - 3));
					
				} else if (gaps[x] > 0) {
					moved.push({
						toX: x, toY: y + gaps[x],
						fromX: x, fromY: y,
						type: getJewel(x, y)
					});
					jewels[x][y + gaps[x]] = getJewel(x, y);
				}
			}
		}
		
		// Fill from top
		for (x = 0; x < cols; x++) {
			for (y = 0; y < gaps[x]; y++) {
				jewels[x][y] = randomJewel();
				moved.push({
					toX: x, toY: y,
					fromX: x, fromY: y - gaps[x],
					type: jewels[x][y]
				});
			}
		}
		
		events = events || [];
		
		if (hadChains) {
			events.push({
				type: "remove",
				data: removed
			}, {
				type: "score",
				data: score
			}, {
				type: "move",
				data: moved
			});
			if (!hasMoves()) {
				fillBoard();
				events.push({
					type: "refill",
					data: getBoard()
				});
			}
			return check(events);
		} else {
			return events;
		}
	}
	
	// Returns true if at least one match can be made
	function hasMoves() {
		for (var x = 0; x < cols; x++) {
			for (var y = 0; y < rows; y++) {
				if (canJewelMove(x, y)) {
					return true;
				}
			}
		}
		return false;
	}
	
	function canJewelMove(x, y) {
		return ((x > 0 && canSwap(x, y, x-1, y)) ||
				(x < cols-1 && canSwap(x, y, x+1, y)) ||
				(y > 0 && canSwap(x, y, x, y-1)) ||
				(y < rows-1 && canSwap(x, y, x, y+1)));
	}
	
	// Create copy of board
	function getBoard() {
		var copy = [], x;
		
		for (x = 0; x < cols; x++) {
			copy[x] = jewels[x].slice(0);
		}
		return copy;
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
		swap: swap,
		canSwap: canSwap,
		getBoard: getBoard,
		print: print
	};
})();
