match3.screens["game-screen"] = (function() {
	var paused, firstRun = true;
	
	function startGame() {
		var board = match3.board,
			display = match3.display,
			dom = match3.dom,
			overlay = dom.$("#game-screen .pause-overlay")[0];
		
		board.initialize(function() {
			display.initialize(function() {
				display.redraw(board.getBoard(), function() {
					// Do nothing for now
				});
			});
		});
		paused = false;
		overlay.style.display = "none";
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
