match3.screens["splash-screen"] = (function() {
	var firstRun = true;
	
	function checkProgress() {
		var $ = match3.dom.$,
			p = match3.getLoadProgress() * 100;
			
		$("#splash-screen .indicator")[0].style.width = p + "%";
		if (p == 100) {
			setup();
		} else {
			setTimeout(checkProgress, 30);
		}
	}
	
	function setup() {
		var dom = match3.dom,
			$ = dom.$,
			screen = $("#splash-screen")[0];
		$(".continue", screen)[0].style.display = "block";
		dom.bind(screen, "click", function() {
			match3.showScreen("main-menu");
		});
	}
	
	function run() {
		if (firstRun) {
			checkProgress();
			firstRun = false;
		}
	}
	
	return {
		run: run
	};
})();
