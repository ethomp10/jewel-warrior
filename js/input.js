match3.input = (function() {
	var inputHandlers,
		gpStates, gpPoller,
		keys = {
			37 : "KEY_LEFT",
			38 : "KEY_UP",
			39 : "KEY_RIGHT",
			40 : "KEY_DOWN",
			13 : "KEY_ENTER",
			32 : "KEY_SPACE",
			65 : "KEY_A",
			66 : "KEY_B",
			67 : "KEY_C",
			/* 68 - 87 */
			88 : "KEY_X",
			89 : "KEY_Y",
			90 : "KEY_Z"
		};
	
	function initialize() {
		var dom = match3.dom,
			$ = dom.$,
			controls = match3.settings.controls,
			board = $("#game-screen .game-board")[0];
		
		inputHandlers = {};
		dom.bind(board, "mousedown", function(event) {
			handleClick(event, "CLICK", event);
		});
		dom.bind(board, "touchstart", function(event) {
			handleClick(event, "TOUCH", event.targetTouches[0]);
		});
		dom.bind(document, "keydown", function(event) {
			var keyName = keys[event.keyCode];
			if (keyName && controls[keyName]) {
				event.preventDefault();
				trigger(controls[keyName]);
			}
		});
		if (getGamepads()) {
			gpStates = [];
			if (!gpPoller) {
				gpPoller = setInterval(pollGamepads, 1000/60);
				// Firefox workaround
				window.addEventListener("gamepadconnected", function(){}, false);
			}
		}
	}
	
	function handleClick(event, control, click) {
		// Is any action bound to this input?
		var settings = match3.settings,
			action = settings.controls[control];
		if (!action) {
			return;
		}
		
		var board = match3.dom.$("#game-screen .game-board")[0],
			rect = board.getBoundingClientRect(),
			relX, relY,
			jewelX, jewelY;
		
		// Click position relative to board
		relX = click.clientX - rect.left;
		relY = click.clientY - rect.top;
		// Jelly coordinates
		jewelX = Math.floor(relX / rect.width * settings.cols);
		jewelY = Math.floor(relY / rect.height * settings.rows);
		// Trigger functions
		trigger(action, jewelX, jewelY);
		// Prevent default click behaviour
		event.preventDefault();
	}
	
	function getGamepads() {
		if (navigator.gamepads) {
			return navigator.gamepads;
		} else if (navigator.getGamepads) {
			return navigator.getGamepads();
		} else if (navigator.webkitGetGamepads) {
			return navigator.webkitGetGamepads();
		}
	}
	
	function pollGamepads() {
		var gamepads = getGamepads(),
			i, gamepad, idx;
		for (i = 0; i < gamepads.length; i++) {
			if (gamepads[i]) {
				gamepad = gamepads[i];
				idx = gamepad.index;
				if (gpStates[idx]) {
					if (gpStates[idx].gamepad != gamepad) {
						gamepadDisconnected(gpStates[idx]);
						gamepadConnected(gamepad);
					}
				} else {
					gamepadConnected(gamepad);
				}
				updateGamepadState(gamepad);
			}
		}
	}
	
	function gamepadConnected(gamepad) {
		gpStates[gamepad.index] = {
			gamepad: gamepad,
			buttons: gamepad.buttons,
			axes: gamepad.axes
		};
		log("Gamepad[" + gamepad.index + "] connected: " + gamepad.id);
	}
	
	function gamepadDisconnected(gamepad) {
		log("Gamepad[" + gamepad.index + "] disconnected: " + gamepad.id);
		delete gpStates[gamepad.index]
	}
	
	function updateGamepadState(gamepad) {
		var state = gpStates[gamepad.index];
		for (var i = 0; i < gamepad.buttons.length; i++) {
			if (gamepad.buttons[i] != state.buttons[i]) {
				state.buttons[i] = gamepad.buttons[i];
				if (state.buttons[i]) {
					gamepadButtonDown(gamepad, i);
				}
			}
		}
		for (var i = 0; i < gamepad.axes.length; i++) {
			if (gamepad.axes[i] != state.axes[i]) {
				state.axesp[i] = gamepad.axes[i];
				gamepadAxisChange(gamepad, i, state.axes[i]);
			}
		}
	}
	
	function gamepadButtonDown(gamepad, buttonIndex) {
		var gpButtons = {0: "BUTTON_A"},
			controls = match3.settings.controls,
			button = gpButtons[buttonIndex];
		if (button && controls[button]) {
			trigger(controls[button]);
		}
	}
	
	function gamepadAxisChange(gamepad, axisIndex, axisValue) {
		var controls = match3.settings.controls,
			controlName;
		
		if (axisIndex === 0 && axisValue === -1) {
			controlName = "LEFT_STICK_LEFT";
		} else if (axisIndex === 0 && axisValue === 1) {
			controlName = "LEFT_STICK_RIGHT";
		} else if (axisIndex === 1 && axisValue === -1) {
			controlName = "LEFT_STICK_UP";
		} else if (axisIndex === 1 && axisValue === 1) {
			controlName = "LEFT_STICK_DOWN";
		}
		if (controlName && controls[controlName]) {
			trigger(controls[controlName]);
		}
	}
	
	function bind(action, handler) {
		if (!inputHandlers[action]) {
			inputHandlers[action] = [];
		}
		inputHandlers[action].push(handler);
	}
	
	function trigger(action) {
		var handlers = inputHandlers[action],
			args = Array.prototype.slice.call(arguments, 1);
		console.log("Game action: " + action);
		if (handlers) {
			for (var i = 0; i < handlers.length; i++) {
				handlers[i].apply(null, args);
			}
		}
	}
	
	return {
		initialize: initialize,
		bind: bind
	};
})();
