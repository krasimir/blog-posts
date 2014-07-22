Because I got a lot of questions about this article I decided to add something here. It's a similar post, but doesn't involve ExpressJS - real time game with pure NodeJS + Socket.io implementation.

# Real time game with NodeJS and Socket.io
(the source code of the game is available [github.com/krasimir/blog-posts/tree/master/RealTimeGameWithSocketio/example](https://github.com/krasimir/blog-posts/tree/master/RealTimeGameWithSocketio/example))

The game is really simple. The user visits the page and gets an unique random username. The only one action that he should take is to click on the green block. Every click adds 1px to the block's width. The goal is to reach 150px and the user which makes the latest click wins. So, the main idea is not to make as many clicks ad possible, but to click in the right moment :)

![real time game](http://krasimirtsonev.com/blog/articles/RealTimeGameWithSocketio/site/realtimegame.jpg)

## Preparations
It's obvious that you should have NodeJS installed. If you don't - please go to [nodejs.org](http://nodejs.org/). The second thing that we need to do is to install our dependencies. In our case they are [socket.io](https://github.com/learnboost/socket.io) (for the real time communication) and [moniker](https://github.com/weaver/moniker) (random name generator). Create an empty *package.json* file and put the following code inside:

	{
	    "name": "SocketioExample",
	    "version": "0.0.1",
	    "description": "SocketioExample",
	    "dependencies": {
	        "socket.io": "latest",
	        "moniker": "latest"
	    },
	    "author": "dev"
	}

After that go to the directory that holds your file and run:

	npm install

The command above will install the dependencies in *node_modules* directory and you will be ready to start coding the game.

## The html page
The *page.html* of the game looks like that:

	<!DOCTYPE html>
	<html>
		<head>
			<title>Real time game</title>
			<style type="text/css">
				... styles here
			</style>
			<script src="/socket.io/socket.io.js"></script>
			<script type="text/javascript">
				window.onload = function() {
					... game logic here
				}
			</script>
		</head>
		<body class="main">
			<div id="welcome"></div>
			<hr />
			<div id="progress"></div>
			<div id="win">150</div>
			<hr />
			<div id="users"></div>
			<hr />
			<div id="results"></div>
		</body>
	</html>

There are several containers:

  - *welcome* - it will show a welcome message and the username of the current user
  - *progress* - the green block which will be clicked by the user
  - *win* - just a marker of the end point
  - *users* - shows the current users and their clicks
  - *results* - shows the user which won the latest game

Have in mind that you don't need to download *socket.io.js*. The back-end part is responsible for this file.

## Running the server
Create an empty *index.js*. The nodejs code will go there. Let's start with a function which will serve the html page to the users.

	var handler = function(req, res) {
		fs.readFile('./page.html', function (err, data) {
		    if(err) throw err;
		    res.writeHead(200);
			res.end(data);
		});
	}

The method reads the *.html* page and simply send it to the browser. Immediately after that define the main variables of the application and start the http server:

	var app = require('http').createServer(handler);
	var io = require('socket.io').listen(app);
	var fs = require('fs');
	var Moniker = require('moniker');
	var port = 3250;

	app.listen(port);

We have enough to test our game, so run the following command in your console/command promp: 

	node index.js

The result should be:
	
	info  - socket.io started

You should be able also to open *http://localhost:3250/* in your browser and see the html page.

## Socket.io back-end code

Socket.io library has really nice event based API. I.e. you have to subscribe or dispatch/emit events to make the communication with the client side. Add this code after the *app.listen(port)*:

	io.sockets.on('connection', function (socket) {
		var user = addUser();
		updateWidth();
		socket.emit("welcome", user);
		socket.on('disconnect', function () {
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

The first line adds listener to the *connection* event which fires every time when a new user visits the game. The handler accepts *socket* object which is actually the socket to that specific user. So, if you want to send something to only this user you should use *socket.emit*. On line 2 a new user object (check below for *addUser* function) is created. It will keep the username of the user and his clicks. There are two other events - *disconnect* (when the user close the browser/tab() and *click* (when he clicks on the green block in the front-end). Pay attention to the usage of *io.sockets.emit*. That's how you will send a message to all the users in the game.

Here is the rest of the back-end code:

	var initialWidth = 20;
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

I think that most of the things are self-explanatory, but shortly:

  - *addUser* - creates a new user with unique random name and adds it to *users* array
  - *removeUser* - removes user from *users* array
  - *updateUsers* - composes string/list with all the current users
  - *updateWidth* - sends the current width of the block to the front-end

## Socket.io front-end code

	window.onload = function() {

		var welcome = document.getElementById("welcome");
		var allUsers = document.getElementById("users");
		var progress = document.getElementById("progress");
		var results = document.getElementById("results");

		var socket = io.connect('http://localhost:3250');
		socket.on('welcome', function (data) {
			console.log(data);
			welcome.innerHTML = "Welcome to the game <strong>" + data.name + "</strong>";
		});
		socket.on('users', function (data) {
			allUsers.innerHTML = "<strong>Users:</strong><br />" + data.users;
		});
		socket.on('update', function (data) {
			progress.innerHTML = data.currentWidth;
			progress.style.width = parseInt(data.currentWidth) + "px";
		});
		socket.on('win', function (data) {
			results.innerHTML = data.message;
		});

		progress.onclick = function() {
			socket.emit("click");
		}

	}

The front-end part of the game is connecting to the http server (by using the specific port). After that there are several listeners which are updating the front end containers. There is only one place where the script sends something to the back-end and this is when the user clicks on the block.

## Conclusion
*Socket.io* is really simple library for delivering real based application. As you can see it has a nice API and good documentation.