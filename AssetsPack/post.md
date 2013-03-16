[AssetsPack](https://github.com/krasimir/assets-pack) is a NodeJS module which helps in organization, compilation and minification of assets. It's meant to be used in local environment during the development process. It was made generally for HTML/CSS/JavaScript based applications.[STOP]

## Why I made it

Few of my latest projects were complete JavaScript application. I.e. mobile sites which are build with only HTML, CSS and JavaScript. I wanted to use [LESS](http://lesscss.org/) preprocessor for the CSS and somehow to put my business logic in different files. Of course, at the end I had to serve a single minified CSS/JS file. It's not so difficult to find modules for all those things, but it's not so easy to setup only one tool which manages everything. Having different programs for every operation added more dependencies to my project, which is not good because all my colleagues had to install the same things. Thankfully NodeJS is stable enough to be used for the purpose. So, I decided to combine all the needed stuff in a single module.

## Features

 - Single JSON file for configuration
 - Watches for changes in specific directories. You run the app and it compiles everything when you change some of you files.
 - Packing/compilation of CSS, LESS, JavaScript, HTML
 - Minification
 - Excluding files

## Installation

You will need NodeJS to be able to run the module. If you don't have it installed please go to [nodejs.org/download](http://nodejs.org/download/) and download the package for your operating system. After that open the console (command prompt under windows) and run:

	npm install -g assetspack

## How it works

Before to start coding you should run the application. It watches your directories for changes and perform packing once something is changed. The module is designed like that so it outputs what file is changed and compiled. It also shows the error if something goes wrong. For example if you make a mistake in LESS syntax.

## Configuration

Let's say that you have the following structure:

	server
	  └ www
	      └ project
	          └ less
	              └ index.less
	              └ mixins.less
	          └ css
	          └ js
	              └ libraryA.js
	              └ libraryB.js

[AssetsPack](https://github.com/krasimir/assets-pack) needs *assets.json* file which keeps the configuration. This file should be in the main project's directory, i.e. in *server/web/project*. The json file contains an array of objects and every object is a separate task. For example:

	[
	    {
	        "type": "js",
	        "watch": "js/",
	        "pack": ["js"],
	        "output": "js/scripts.js",
	        "minify": true,
	        "exclude": ["js/libraryA.js"]
	    },
	    {
	        "type": "less",
	        "watch": ["less"],
	        "pack": "less/index.less",
	        "output": "css/styles.css",
	        "minify": true
	    }
	]

Have in mind that the paths here are relative to the path of the *assets.json*. 

The task object format is as follows:

	{
    	"type": (file type /string, could be css, js or less for example),
	    "watch": (directory or directories for watching /string or array of strings/),
	    "pack": (directory or directories for packing /string or array of strings/. ),
	    "output": (path to output file /string/),
	    "minify": /boolean/,
	    "exclude": (array of file names)
	}

Here are few examples:

### Packing CSS

	{
	    "type": "css",
	    "watch": ["tests/data/css", "tests/data/css2"],
	    "pack": ["tests/data/css", "tests/data/css2"],
	    "output": "tests/packed/styles.css",
	    "minify": true,
	    "exclude": ["header.css"]
	}

### Packing JavaScript

	{
	    "type": "js",
	    "watch": "tests/data/js",
	    "pack": ["tests/data/js"],
	    "output": "tests/packed/scripts.js",
	    "minify": true,
	    "exclude": ["A.js"]
	}

### Packing less
The packing of .less files is a little bit different. *pack* property is mandatory and it is basically your entry point. You should import all the others less files there. The exclude is not available here.

	{
	    "type": "less",
	    "watch": ["tests/data/less"],
	    "pack": "tests/data/less/index.less",
	    "output": "tests/packed/styles-less.css",
	    "minify": true
	}

### Packing other file formats
[AssetsPack](https://github.com/krasimir/assets-pack) works with any file format. For example we can combine html templates into a single file:

	{
	    "type": "html",
	    "watch": ["tests/data/tpl"],
	    "output": "tests/packed/template.html",
	    "exclude": ["admin.html"]
	}

The only one thing that you should know here is that there is no minification.

## Run the tool

### 1. Via the command line

Go to the directory that contains *assets.json* file and run:

	assetspack

If your configuration file is with another name or you want to execute the module from another directory use:

	assetspack --config [path to json file]

### 2. In code

	var AssetsPack = require("assetspack");
	var config = [
	    {
	        type: "css",
	        watch: ["css/src"],
	        output: "tests/packed/styles.css",
	        minify: true,
	        exclude: ["custom.css"]
	    }
	];
	var pack = new AssetsPack(config, function() {
	    console.log("AssetsPack is watching");
	});
	pack.onPack(function() {
	    console.log("AssetsPack did the job"); 
	});

## Conclusion

As I said, the main purpose of the module is to help developing HTML/CSS/JavaScript based application. But it can be used in any other web project. Normally the developers add logic for compilation and minification inside their back-end code. This of course makes the code a little bit more complex and probably decreases the performance in some cases. It will be nice if you (as a front-end developer) deliver directly the compiled css and javascript code. You could use [AssetsPack](https://github.com/krasimir/assets-pack) locally and at the end commit the needed files. There are some people which will say that committing minified files is not a good idea, but you should definitely think about such a workflow.

## Problems

If you have any problems with the module feel free to comment below or just check the tests in the [GitHub repository](https://github.com/krasimir/assets-pack/tree/master/tests).

## Contribution

The code of the module is available in GitHub [here](https://github.com/krasimir/assets-pack). Feel free to fork it and make changes.