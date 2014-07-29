# Migrating from Express 3.0 to 4.0

Before a couple of months my first book [Node.js Blueprints](http://nodejs.krasimirtsonev.com/) was published by [Packt](https://www.packtpub.com/nodejs-blueprints/book). There are a couple of reviews in [Amazon](http://www.amazon.com/Node-js-Blueprints-Krasimir-Tsonev/product-reviews/1783287330) about chapter two. It's about [Express](http://expressjs.com/). One of the most popular frameworks in the Node.js ecosystem. The book mentions version 3.0 but the truth is that the code samples are for version 4.0. I feel that I still have to point out the differences and mark these parts of the chapter that are not valid for the newest version of the library.

## The [connect](https://github.com/senchalabs/connect) dependency

Express 4.0 is not depending on [connect](https://github.com/senchalabs/connect) module. However, this doesn't mean that the framework don't use a middleware architecture. It still works by using this design pattern. The difference is that the middlewares, i.e. the plugins, are not part of Express's package anymore. They have to be installed additionally. For example, so far we used:

	app.use(express.bodyParser());

With 4.0 we have to add [body-parser](https://github.com/expressjs/body-parser) module and use the following syntax:

	var bodyParser = require('body-parser');
	app.use(bodyParser());

## Installation

There are no changes in this area. Still the framework could be installed in two ways

* Add `"express": "4.x"` in the `package.json` file.
* Via the command line tool `express-generator`.

The [Getting started](http://expressjs.com/guide.html#intro) section of the official site demonstrates the both methods.

## The basic example

The very basic example used in the book is still up-to-date.

	var express = require('express');
	var app = express();
	app.get("/", function(req, res, next) {
		res.send("Hello world");
	}).listen(1337);
	console.log('Server running at http://127.0.0.1:1337/');

The `app.verb()` APIs are kept and we could still use them. For example, in the code above we successfully processed a GET request passed to the root path of our application. If we need to handle POST or PUT request we are free to use `.post` and `.put` methods.

If we use the command line tool and run:

	npm install -g express-generator
	express --css less myapp

We will still get the old skeleton. The generated directories and files are the same. To run the application we have to execute the following commands:

	npm install
	npm start

Our Express server listens on *localhost* at port 3000.

## The book

In fact, the example demonstrated in *Node.js Blueprints* uses version 4. In the `package.json` coming along with the book we have:

	"dependencies": {
    	"express": "~4.0.0"
    	...

This installs the version that uses the new APIs. So, you don't have to change the code or look for migration advices. I reread the chapter two and I could confirm that the published snippets and screenshots are actually for version 4. For example, the following image is from page 27:

![ExpressJS Node.js Blueprints](http://krasimirtsonev.com/blog/articles/ExpressJS/7338_02_02.png)