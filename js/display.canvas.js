match3.display = (function() {
	var canvas, ctx, cursor,
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
			jewelSprite.src = "images/jellies" + jewelSize + ".png";
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
	
	function moveJewels(movedJewels, callback) {
		var n = movedJewels.length,
			mover, i;
		for (i = 0; i < n; i++) {
			mover = movedJewels[i];
			clearJewel(mover.fromX, mover.fromY);
		}
		for (i = 0; i < n; i++) {
			mover = movedJewels[i];
			drawJewel(mover.type, mover.toX, mover.toY);
		}
		callback();
	}
	
	function removeJewels(removedJewels, callback) {
		var n = removedJewels.length;
		for (var i = 0; i < n; i++) {
			clearJewel(removedJewels[i].x, removedJewels[i].y);
		}
		callback();
	}
	
	function clearJewel(x, y) {
		ctx.clearRect(x * jewelSize, y * jewelSize, jewelSize, jewelSize);
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
		renderCursor();
	}
	
	function renderCursor() {
		if (!cursor) {
			return;
		}
		var x = cursor.x,
			y = cursor.y;
		
		clearCursor();
		
		if (cursor.selected) {
			ctx.save();
			ctx.globalCompositeOperation = "lighter";
			ctx.globalAlpha = 0.8;
			drawJewel(jewels[x][y], x, y);
			ctx.restore();
		}
		ctx.save();
		ctx.lineWidth = 0.05 * jewelSize;
		ctx.strokeStyle = "rgba(250, 250, 150, 0.8)";
		ctx.strokeRect((x + 0.05) * jewelSize, (y + 0.05) * jewelSize,
			0.9 * jewelSize, 0.9 * jewelSize);
		ctx.restore();
	}
	
	function clearCursor() {
		if (cursor) {
			var x = cursor.x,
				y = cursor.y;
			clearJewel(x, y);
			drawJewel(jewels[x][y], x, y);
		}
	}
	
	function setCursor(x, y, selected) {
		clearCursor();
		if (arguments.length > 0) {
			cursor = {x: x, y: y, selected: selected};
		} else {
			cursor = null;
		}
		renderCursor();
	}
	
	return {
		initialize: initialize,
		redraw: redraw,
		setCursor: setCursor,
		moveJewels: moveJewels,
		removeJewels: removeJewels,
		refill: redraw
	};
})();
