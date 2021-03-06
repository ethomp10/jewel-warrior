var match3 = (function() {
	var settings = {
		rows: 8,
		cols: 8,
		baseScore: 100,
		numJewelTypes: 7,
		controls: {
			// Keyboard
			KEY_UP: "moveUp",
			KEY_LEFT: "moveLeft",
			KEY_DOWN: "moveDown",
			KEY_RIGHT: "moveRight",
			KEY_ENTER: "selectJewel",
			KEY_SPACE: "selectJewel",
			// Mouse & touch
			CLICK: "selectJewel",
			TOUCH: "selectJewel",
			// Gamepad
			BUTTON_A: "selectJewel",
			LEFT_STICK_UP: "moveUp",
			LEFT_STICK_DOWN: "moveDown",
			LEFT_STICK_LEFT: "moveLeft",
			LEFT_STICK_RIGHT: "moveRight"
		}
	};
	
	var scriptQueue = [],
		numResourcesLoaded = 0,
		numResources = 0,
		executeRunning = false;
		
	function preload(src) {
		var image = new Image();
		image.src = src;
	}

	function executeScriptQueue() {
		var next = scriptQueue[0], first, script;
		if (next && next.loaded) {
			executeRunning = true
			// Remove first element in queue
			scriptQueue.shift();
			first = document.getElementsByTagName("script")[0];
			script = document.createElement("script");
			script.onload = function() {
				if (next.callback) {
					next.callback();
				}
				// Try to execute more scripts
				executeScriptQueue();
			};
			script.src = next.src;
			first.parentNode.insertBefore(script, first);
		} else {
			executeRunning = false;
		}
	}

	function load(src, callback) {
		var image, queueEntry;
		numResources++;

		// Add resource to execution queue
		queueEntry = {
			src: src,
			callback: callback,
			loaded: false
		};
		scriptQueue.push(queueEntry);

		image = new Image();
		image.onload = image.onerror = function() {
			numResourcesLoaded++;
			queueEntry.loaded = true;
			if (!executeRunning) {
				executeScriptQueue();
			}
		};
		image.src = src;
	}

	// Hide active screen (if any) and show screen with specified ID
	function showScreen(screenId) {
		var dom = match3.dom,
			$ = dom.$,
			activeScreen = $("#game .screen.active")[0],
			screen = $("#" + screenId)[0];
		if (!match3.screens[screenId]) {
			alert("This module is not implemented yet!");
			return;
		}
		if (activeScreen) {
			dom.removeClass(activeScreen, "active");
		}
		dom.addClass(screen, "active");
		// Run screen module
		match3.screens[screenId].run();
	}
	
	function isStandalone() {
		return (window.navigator.standalone !== false);
	}

	function setup() {
		// Disable overscroll
		match3.dom.bind(document, "touchmove", function(event) {
			event.preventDefault();
		});
		// Hide address bar on Android
		if (/Android/.test(navigator.userAgent)) {
			match3.dom.$("html")[0].style.height = "200%";
			setTimeout(function() {
				window.scrollTo(0, 1);
			}, 0);
		}
		if (isStandalone()) {
			showScreen("splash-screen");
		} else {
			showScreen("install-screen");
		}
	}
	
	function hasWebWorkers() {
		return ("Worker" in window);
	}
	
	function getLoadProgress() {
		return numResourcesLoaded / numResources;
	}
	
	// Expose public methods
	return {
		getLoadProgress: getLoadProgress,
		preload: preload,
		load: load,
		setup: setup,
		settings: settings,
		showScreen: showScreen,
		screens: {},
		isStandalone: isStandalone,
		hasWebWorkers: hasWebWorkers
	};
})();
