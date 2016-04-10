match3.display = (function() {
	var canvas, ctx,
		cols, rows,
		jewels, jewelSize, jewelSprite,
		firstRun = true;
	
	function setup() {
		var $ = match3.dom.$,
			boardElement = $("#game-screen .game-board")[0];
		
		cols = match3.settings.cols;
		rows = match3.settings.rows;
		
		canvas = document.createElement("canvas");
		ctx = canvas.getContext("2d");
		match3.dom.addClass(canvas, "board");
		
		var rect = boardElement.getBoundingClientRect();
		canvas.width = rect.width;
		canvas.height = rect.height;
		jewelSize = rect.width / cols;
		
		boardElement.appendChild(createBackground());
		boardElement.appendChild(canvas);
	}
	
	function initialize(callback) {
		if (firstRun) {
			setup();
			jewelSprite = new Image();
			jewelSprite.addEventListener("load", callback, false);
			jewelSprite.src = "images/jewels" + jewelSize + ".png";
			firstRun = false;
		} else {
			callback();
		}
	}
	
	function createBackground() {
		var background = document.createElement("canvas"),
			bgctx = background.getContext("2d");
			
		match3.dom.addClass(background, "background");
		background.width = cols * jewelSize;
		background.height = rows * jewelSize;
		
		bgctx.fillStyle = "rgba(225, 235, 255, 0.15)";
		for (var x = 0; x < cols; x++) {
			for (var y = 0; y < cols; y++) {
				if ((x + y) % 2) {
					bgctx.fillRect(x * jewelSize, y * jewelSize, jewelSize, jewelSize);
				}
			}
		}
		return background;
	}
	
	function drawJewel(type, x, y) {
		ctx.drawImage(jewelSprite, type * jewelSize, 0,
			jewelSize, jewelSize,
			x * jewelSize, y * jewelSize,
			jewelSize, jewelSize
		);
	}
	
	function redraw(newJewels, callback) {
		var x, y;
		jewels = newJewels;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (x = 0; x < cols; x++) {
			for (y = 0; y < rows; y++) {
				drawJewel(jewels[x][y], x, y);
			}
		}
		callback();
	}
	
	return {
		initialize: initialize,
		redraw: redraw
	};
})();
