var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , Moniker = require('moniker')
  , port = 3250;

// reading page's html
var getHTMLCode = function(callback) {
	fs.readFile('./site/page.html', function (err, data) {
	    if (err) {
	    	callback(err);
	    } else {
	    	callback(err, data);
		}
	});
}

// starting http server


app.listen(port);

function handler (req, res) {
	getHTMLCode(function(err, data) {
		if(err) throw err;
		res.writeHead(200);
		res.end(data);
	})
}

// launching socket.io
io.sockets.on('connection', function (socket) {
	var user = addUser();
	updateWidth(user);
	socket.emit("welcome", user);
	socket.on('disconnect', function () {
		totalPlayers -= 1;
		removeUser(user);
  	});
  	socket.on("click", function() {
  		currentWidth += 1;
  		user.clicks += 1;
  		if(currentWidth == winWidth) {
  			currentWidth = initialWidth;
  			io.sockets.emit("win", { message: "<strong>" + user.name + "</strong> rocks!" });
  		}
  		updateWidth();
  		updateUsers();
  	});
});

// game logic
var totalPlayers = 0;
var initialWidth = 22;
var currentWidth = initialWidth;
var winWidth = 150;
var users = [];

var addUser = function() {
	var user = {
		name: Moniker.choose(),
		clicks: 0
	}
	users.push(user);
	updateUsers();
	return user;
}
var removeUser = function(user) {
	for(var i=0; i<users.length; i++) {
		if(user.name === users[i].name) {
			users.splice(i, 1);
			updateUsers();
			return;
		}
	}
}
var updateUsers = function() {
	var str = '';
	for(var i=0; i<users.length; i++) {
		var user = users[i];
		str += user.name + ' <small>(' + user.clicks + ' clicks)</small><br />';
	}
	io.sockets.emit("users", { users: str });
}
var updateWidth = function() {
	io.sockets.emit("update", { currentWidth: currentWidth });
}