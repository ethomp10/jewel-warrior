var match3 = {};

importScripts("board.js");

addEventListener("message", function(event) {
	var board = match3.board,
		message = event.data;
	
	switch (message.command) {
		case "initialize":
			match3.settings = message.data;
			board.initialize(callback);
			break;
		case "swap":
			board.swap(
				message.data.x1,
				message.data.y1,
				message.data.x2,
				message.data.y2,
				callback
			);
			break;
	}
	
	function callback(data) {
		postMessage({
			id: message.id,
			data: data,
			jewels: board.getBoard()
		});
	}
	
}, false);
