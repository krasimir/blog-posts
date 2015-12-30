# Start your own JavaScript library using webpack and ES6

Two months ago I [published](http://krasimirtsonev.com/blog/article/a-modern-react-starter-pack-based-on-webpack) a starter pack for React based on [webpack](https://webpack.github.io/). Today I found out that I need almost the same thing but without the React bit. This simplifies the setup but there are still some tricky parts. So, I made a brand new repository [webpack-library-starter](https://github.com/krasimir/webpack-library-starter) and placed all the stuff that we need for creating a JavaScript library.

## First of all, what I meant by saying "library"

My definition for library in the context of JavaScript is a piece of code that provides specific functionality. It does one thing and it is doing it well. In the ideal case should not depend on another library or framework. A good example for library is jQuery. [React](https://facebook.github.io/react/) and [Vue.js](http://vuejs.org/) could be also considered a library.

The library should:

* Be available for in-browser use. Understand including the library via `<script>` tag.
* Be accessible through [npm](https://www.npmjs.com/)
* Be compatible with ES6(ES2015) module system, [commonjs](http://www.commonjs.org/) and [amd](https://github.com/amdjs/amdjs-api/blob/master/AMD.md) specifications.

It doesn't matter what is used for developing the library. What is important is the file that is distributed. It should match the above requirements. I prefer to see libraries written in vanilla JavaScript though. It simply makes the contribution easier.

## Directory structure

I choose the following directory structure:

```
+-- lib
|   +-- library.js
|   +-- library.min.js
+-- src
|   +-- index.js
+-- test
```

Where `src` contains the source files and `lib` the final compiled version. This means that the entry point of the library is the file under `lib` and not `src`.

## The starter

I really enjoy the new ES6 specification. The bad thing is that there is some significant tooling around it. Some day we'll probably write such JavaScript without the need of transpiler but today that's not the case. Usually we need some sort of [Babel](http://babeljs.io/) integration. Babel can convert our ES6 files to ES5 format but it is not meant to create bundles. Or in other words, if we have the following files:

```
+-- lib
+-- src
    +-- index.js (es6)
    +-- helpers.js (es6)
```

And we apply Babel we'll get:

```
+-- lib
|   +-- index.js (es5)
|   +-- helpers.js (es5)
+-- src
    +-- index.js (es6)
    +-- helpers.js (es6)
```

Or in other words Babel do not resolve the imports/requires. So we need a bundler and as you may guess my choice for that is [webpack](https://webpack.github.io/). What I want to achieve at the end is:

```
+-- lib
|   +-- library.js (es5)
|   +-- library.min.js (es5)
+-- src
    +-- index.js (es6)
    +-- helpers.js (es6)
```

### npm commands

npm provides a nice mechanism for running tasks - [scripts](https://docs.npmjs.com/misc/scripts). There should be at least three of those registered:

```
"scripts": {
  "build": "...",
  "dev": "...",
  "test": "..."
}
```

* `npm run build` - this should produce a final minified version of our library
* `npm run dev` - the same as `build` but do not minify the result and keeps working in a watching mode
* `npm run test` - runs the tests

### Building the development version

`npm run dev` should fire webpack and should produce `lib/library.js` file. We start from the webpack's configuration file:

```
// webpack.config.js

var webpack = require('webpack');
var path = require('path');
var libraryName = 'library';
var outputFile = libraryName + '.js';

var config = {
  entry: __dirname + '/src/index.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/lib',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel',
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    root: path.resolve('./src'),
    extensions: ['', '.js']
  }
};

module.exports = config;
```

Even if you don't have experience with webpack you may say what is this config file doing. We define the input (`entry`) and the output (`output`) of the compilation. The `module` property says what should be applied against every file during processing. In our case this is babel and [ESLint](http://eslint.org/) where ESLint is a used for checking the syntax and correctness of our code. 

There is one tricky part where I spent couple of ours. It's related to `library`, `libraryTarget` and `umdNamedDefine` properties. First I tried without using them and the output of the library was something like this:

```
(function(modules) {
  var installedModules = {};

  function __webpack_require__(moduleId) {
    if(installedModules[moduleId]) return installedModules[moduleId].exports;

    var module = installedModules[moduleId] = {
      exports: {},
      id: moduleId,
      loaded: false
    };
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    module.loaded = true;
    return module.exports;
  }

  __webpack_require__.m = modules;
  __webpack_require__.c = installedModules;
  __webpack_require__.p = "";

  return __webpack_require__(0);
})([
  function(module, exports) {
    // ... my code here
  }
]);
```

This is how every webpack compiled code looks like. It uses similar approach like [browserify](http://browserify.org/). There is a self-invoking function which receives all the modules used in our application. Every of them stays behind an index of the `modules` array. In the code above we have only one and `__webpack_require__(0)` effectively runs the code in our `src/index.js` file.

Having a bundle like this one do not fulfill all the requirements mentioned in the beginning of this article because we do not export anything. The file is meant to be dropped in a web page. However, adding `library`, `libraryTarget` and `umdNamedDefine` makes webpack injecting a really nice snippet at the top:

```
(function webpackUniversalModuleDefinition(root, factory) {
  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
  else if(typeof define === 'function' && define.amd)
    define("library", [], factory);
  else if(typeof exports === 'object')
    exports["library"] = factory();
  else
    root["library"] = factory();
})(this, function() {
return (function(modules) {
 ...
 ...
```

Setting `libraryTarget` to `umd` means using [universal module definition](https://github.com/umdjs/umd) for the final result. And indeed, this piece of code recognizes the environment and provides a proper  bootstrapping mechanism for our library. 

### Building production version

The only one difference between development and production mode for webpack is the minification. Running `npm run build` should produce a minified version - `library.min.js`. webpack has a nice build-in plugin for that:

```
// webpack.config.js

...
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var env = process.env.WEBPACK_ENV;

var libraryName = 'library';
var plugins = [], outputFile;

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
  outputFile = libraryName + '.min.js';
} else {
  outputFile = libraryName + '.js';
}

var config = {
  entry: __dirname + '/src/index.js',
  devtool: 'source-map',
  output: { ... },
  module: { ... },
  resolve: { ... },
  plugins: plugins
};

module.exports = config;
```

`UglifyJsPlugin` does the job if we add it to the `plugins` array. There is something else that we have to clarify. We need some conditional logic where we instruct webpack what kind of bundle to produce (production or development). One of the popular approaches is to define an environment variable and pass it from the command line. For example:

```
// package.json

"scripts": {
  "build": "WEBPACK_ENV=build webpack",
  "dev": "WEBPACK_ENV=dev webpack --progress --colors --watch"
}
```

(Notice the `--watch` option. It makes webpack continuously running and watching for changes)

### Testing

I'm usually using [Mocha](http://mochajs.org/) and [Chai](http://chaijs.com/) for testing and that's what I added in the starter. Again there was a tricky part making Mocha understands ES6 files but thankfully to Babel the problem was resolved.

```
// package.json
"scripts": {
  ...
  "test": "mocha --compilers js:babel-core/register --colors -w ./test/*.spec.js"
}
```

The important bit is the `--compilers` option. It allows us to process the incoming file before running it.

## A few other configuration file added to the starter

Babel received some major changes in the newest version 6. We now have something called `presets` where we describe what kind of transformation we want. One of the easiest ways to configure that is with a `.babelrc` file:

```
// .babelrc
{
  "presets": ["es2015"],
  "plugins": ["babel-plugin-add-module-exports"]
}
```

ESLint provides the same thing and we have `.eslintrc`:

```
// .eslintrc
{
  "ecmaFeatures": {
    "globalReturn": true,
    "jsx": true,
    "modules": true
  },
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "globals": {
    "document": false,
    "escape": false,
    "navigator": false,
    "unescape": false,
    "window": false,
    "describe": true,
    "before": true,
    "it": true,
    "expect": true,
    "sinon": true
  },
  "parser": "babel-eslint",
  "plugins": [],
  "rules": {
    // ... lots of lots of rules here
  }
}
```

## Links

The starter is available in GitHub here [github.com/krasimir/webpack-library-starter](https://github.com/krasimir/webpack-library-starter).

Used tools:

* [webpack](https://webpack.github.io/)
* [Babel](http://babeljs.io)
* [ESLint](http://eslint.org/)
* [Mocha](http://mochajs.org/), [Chai](http://chaijs.com/)
* [UMD](https://github.com/umdjs/umd)

Dependencies:

```
// package.json
"devDependencies": {
  "babel": "6.3.13",
  "babel-core": "6.1.18",
  "babel-eslint": "4.1.3",
  "babel-loader": "6.1.0",
  "babel-plugin-add-module-exports": "0.1.2",
  "babel-preset-es2015": "6.3.13",
  "chai": "3.4.1",
  "eslint": "1.7.2",
  "eslint-loader": "1.1.0",
  "mocha": "2.3.4",
  "webpack": "1.12.9"
}
```


























