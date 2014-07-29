var express = require('express');
var app = express();
app.get("/", function(req, res, next) {
	res.send("Hello world");
}).listen(1337);
console.log('Server running at http://127.0.0.1:1337/');