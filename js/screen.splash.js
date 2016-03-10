match3.screens["splash-screen"] = (function() {
	var firstRun = true;
	
	function setup() {
		match3.dom.bind("#splash-screen", "click", function() {
			match3.showScreen("main-menu");
		});
	}
	
	function run() {
		if (firstRun) {
			setup();
			firstRun = false;
		}
	}
	
	return {
		run: run
	};
})();
