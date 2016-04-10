match3.screens["game-screen"] = (function() {
	var firstRun = true,
		paused,
		cursor;
	
	function startGame() {
		var board = match3.board,
			display = match3.display,
			dom = match3.dom,
			overlay = dom.$("#game-screen .pause-overlay")[0];
		
		board.initialize(function() {
			display.initialize(function() {
				cursor = {x: 0, y: 0, selected: false};
				display.redraw(board.getBoard(), function() {
					// Do nothing for now
				});
			});
		});
		paused = false;
		overlay.style.display = "none";
	}
	
	function setCursor(x, y, select) {
		cursor.x = x;
		cursor.y = y;
		cursor.selected = select;
		match3.display.setCursor(x, y, select);
	}
	
	function moveCursor(x, y) {
		var settings = match3.settings;
		if (cursor.selected) {
			x += cursor.x;
			y += cursor.y;
			if (x >= 0 && x < settings.cols && y >= 0 && y < settings.rows) {
				selectJewel(x, y);
			}
		} else {
			x = (cursor.x + x + settings.cols) % settings.cols;
			y = (cursor.y + y + settings.rows) % settings.rows;
			setCursor(x, y, false);
		}
	}
	
	function moveUp() {
		moveCursor(0, -1);
	}
	
	function moveDown() {
		moveCursor(0, 1);
	}
	
	function moveLeft() {
		moveCursor(-1, 0);
	}
	
	function moveRight() {
		moveCursor(1, 0);
	}
	
	function selectJewel(x, y) {
		if (arguments.length === 0) {
			selectJewel(cursor.x, cursor.y);
			return;
		}
		if (cursor.selected) {
			var dx = Math.abs(x - cursor.x),
				dy = Math.abs(y - cursor.y),
				dist = dx + dy;
			
			if (dist === 0) {
				// Deselected jelly
				setCursor(x, y, false);
			} else if (dist == 1) {
				// Selected an adjacent jelly
				match3.board.swap(cursor.x, cursor.y, x, y, playBoardEvents);
				setCursor(x, y, false);
			} else {
				// Selected a different jelly
				setCursor(x, y, true);
			}
		} else {
			setCursor(x, y, true);
		}
	}
	
	function playBoardEvents(events) {
		var display = match3.display;
		if (events.length > 0) {
			var boardEvent = events.shift(),
				next = function() {
					playBoardEvents(events);
				};
			switch (boardEvent.type) {
				case "move":
					display.moveJewels(boardEvent.data, next);
					break;
				case "remove":
					display.removeJewels(boardEvent.data, next);
					break;
				case "refill":
					display.refill(boardEvent.data, next);
					break;
				default:
					next();
					break;
			}
		} else {
			display.redraw(match3.board.getBoard(), function() {
				// Good to go
			});
		}
	}
	
	function pauseGame() {
		if (paused) {
			return; // Do nothing if paused
		}
		var dom = match3.dom,
			overlay = dom.$("#game-screen .pause-overlay")[0];
		overlay.style.display = "block";
		paused = true;
	}
	
	function resumeGame() {
		var dom = match3.dom,
			overlay = dom.$("#game-screen .pause-overlay")[0];
		overlay.style.display = "none";
		paused = false;
	}
	
	function exitGame() {
		pauseGame();
		var confirmed = window.confirm("Do you want to return to the main menu?");
		if (confirmed) {
			match3.showScreen("main-menu");
		} else {
			resumeGame();
		}
	}
	
	function setup() {
		var dom = match3.dom;
		dom.bind("footer button.exit", "click", exitGame);
		dom.bind("footer button.pause", "click", pauseGame);
		dom.bind(".pause-overlay", "click", resumeGame)
		
		var input = match3.input;
		input.initialize();
		input.bind("selectJewel", selectJewel);
		input.bind("moveUp", moveUp);
		input.bind("moveDown", moveDown);
		input.bind("moveLeft", moveLeft);
		input.bind("moveRight", moveRight);
	}
	
	function run() {
		if (firstRun) {
			setup();
			firstRun = false;
		}
		startGame();
	}
	
	return {
		run: run
	};
})();
