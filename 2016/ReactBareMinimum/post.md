# The bare minimum to work with React

Half an year ago I published [A modern React starter pack based on webpack](http://krasimirtsonev.com/blog/article/a-modern-react-starter-pack-based-on-webpack). The starter provides the basic tooling around React. However, I noticed that very often I need even less stuff than that. That's usually when I want to hack something quickly. In this blog post we'll see what's the bare minimum to work with React.

Let's get the following `jsx` file

```
// component.jsx
import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  render() {
    return <h1>Hello world</h1>;
  }
};

ReactDOM.render(<App />, document.querySelector('#container'));
```

and see how we can convert it to a single file that works in the browser.

## The syntax

There are few points to consider:

* There are ES6 import statements
* we have a class definition
* The `render` method contains a JSX expression

The very first task in our setup should be to compile the file to valid ES2015 JavaScript. As you probably know, there is a module called [babel](https://babeljs.io) that could transpile our code to the desired format. So, let's bring [babel-cli](http://babeljs.io/docs/usage/cli/) (the command line version) and see what will happen:

```
npm i babel-cli
./node_modules/.bin/babel ./component.jsx
```

The result is as follows:

```
SyntaxError: ./component.jsx: Unexpected token (6:11)
  4 | class App extends React.Component {
  5 |   render() {
> 6 |     return <h1>Hello world</h1>;
    |            ^
  7 |   }
  8 | };
  9 |
```

Hm ... it looks like babel doesn't understand our JSX tags. This problem could be solved by adding a babel [preset](https://babeljs.io/docs/plugins/#official-presets) [babel-preset-react](http://babeljs.io/docs/plugins/preset-react/).

```
npm i babel-cli babel-preset-react
# make a .babelrc (config file) with the preset
echo '{ "presets": ["react"] }' > .babelrc
./node_modules/.bin/babel ./component.jsx
```

To instruct babel-cli for the existing preset we have to create a `.babelrc` file. When the above is done we receive a correct output:

```
import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  render() {
    return React.createElement(
      'h1',
      null,
      'Hello world'
    );
  }
};

ReactDOM.render(React.createElement(App, null), document.querySelector('#container'));
```

Now that's ok. There is no JSX anymore. But we can't run the result in a browser because we have import statements and class definition. We need another preset - [babel-preset-es2015](http://babeljs.io/docs/plugins/preset-es2015/)

```
npm i babel-cli babel-preset-react babel-preset-es2015
# make a .babelrc (config file) with the preset
echo '{ "presets": ["react", "es2015"] }' > .babelrc
./node_modules/.bin/babel ./component.jsx
```

After adding the new preset the process is a little bit slower and the output is not that short:

```
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');
var _react2 = _interopRequireDefault(_react);
var _reactDom = require('react-dom');
var _reactDom2 = _interopRequireDefault(_reactDom);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
  _inherits(App, _React$Component);
  function App() {
    _classCallCheck(this, App);
    return _possibleConstructorReturn(this, Object.getPrototypeOf(App).apply(this, arguments));
  }
  _createClass(App, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'h1',
        null,
        'Hello world'
      );
    }
  }]);
  return App;
}(_react2.default.Component);
;
_reactDom2.default.render(_react2.default.createElement(App, null), document.querySelector('#container'));
```

That's because the class definition polyfill. We could say that this code is kinda ES2015 compatible and could be run by the browsers today except one thing - the `require` calls.

## Bundler

The transpilation of React takes three commands in the terminal - installation of `babel` and its presets, creating a `.babelrc` file and running `babel`. Of course the first two are required only the first time. That's not bad but it's not enough. We miss `react` and `react-dom` modules. We need a tool that not only transforms the syntax of our code but also resolves the dependencies. We call such tools *bundlers*. There is some confusion around bundlers, build systems and task runners. [Gulp](https://github.com/gulpjs) for example is a build system. It simply runs different tasks in a specific order using streams. [Grunt](http://gruntjs.com/) is really similar module too. The idea with `Gulp` and `Grunt` is that we can plug other modules and manipulate or aggregate our source code (even images). While the goal of the bundler is to merge everything into a single file. Some libraries like [webpack](https://webpack.github.io/) combine features from both worlds. `webpack` is more like a bundler but also accepts plugins (called *loaders*).

One of the first bundlers that were published is [browserify](http://browserify.org/). That's what I like to use. Mainly because it's simple and does only one job. It resolves the `requires` in my code and outputs a single file. The drawback here is that browserify doesn't transpiler the code. It works with ES2015 compatible code. Classes and JSX don't work by default. Thankfully there is a [babelify](https://github.com/babel/babelify) - a browserify transformer that injects `babel` to the process.

```
npm i react react-dom babel-preset-react babel-preset-es2015 browserify babelify
# make a .babelrc (config file) with the preset
echo '{ "presets": ["react", "es2015"] }' > .babelrc
./node_modules/.bin/browserify ./component.jsx -o ./bundle.js -t babelify
```

We no longer use babel-cli so the needed dependencies become `react`, `react-dom`, `babel-preset-react`, `babel-preset-es2015`, `browserify` and `babelify`. Notice that we still have to create `.babelrc` file.

The produced `bundle.js` file is 676K big and contains our component and the React library. If we minify it with a module like [uglify](https://github.com/mishoo/UglifyJS2) it goes down to 369K.

## Watcher

While develop we don't like running same command again and again. That's why we want our bundler to listen for changes and fire the compilation again once we edit some of the files. For the setup in this article an appropriate choice for that is [watchify](https://github.com/substack/watchify). It's the same as `browserify` but listens for changes. So, the bare minimum could be changed to:

```
npm i react react-dom babel-preset-react babel-preset-es2015 watchify babelify
# make a .babelrc (config file) with the preset
echo '{ "presets": ["react", "es2015"] }' > .babelrc
./node_modules/.bin/watchify ./component.jsx -o ./bundle.js -t babelify -v
```

## In a project

I like defining a `package.json` file for all the these above. In this case:

```json
{
  "name": "react-app",
  "version": "1.0.0",
  "description": "react application",
  "scripts": {
    "build": "browserify ./src/app.jsx -o ./public/app.js -t babelify",
    "watch": "watchify ./src/app.jsx -o ./public/app.js -t babelify -v"
  },
  "dependencies": {
    "babel-preset-es2015": "6.9.0",
    "babel-preset-react": "6.5.0",
    "babelify": "7.3.0",
    "browserify": "13.0.1",
    "react": "15.1.0",
    "react-dom": "15.1.0",
    "watchify": "3.7.0"
  }
}
```

And there are three `npm` commands to remember:

```
# install the dependencies
npm i

# compile the react app only once
npm run build

# develop the app
npm run watch
```