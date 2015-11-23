# Distributing React components

While I was open sourcing [react-place](https://github.com/krasimir/react-place) I noticed that there is some complexity around preparing the component for releasing. I decided to document it here. A few steps that I took once the component was ready. You may be surprised but writing the working `jsx` file doesn't mean that the component is ready for publishing and is usable for the other developers.

## The component

[react-place](https://github.com/krasimir/react-place) is a component that renders an input field. The user starts typing a city name and the component makes predictions/suggestions. The component accepts a property called `onLocationSet`. It is fired once the user selects some of the suggestions. The function receives an object containing short description and geo coordinates of the city. We have a communication with external API (Google maps) and a hard dependency involved (autocomplete widget). Let's see how the development went and why after finishing the component it wasn't ready for publishing.

## Toolset

There are few things which are at the top of the wave right now. One of them is React and its [JSX syntax](https://facebook.github.io/react/docs/jsx-in-depth.html). Another one is the new ES6 spec and all these goodies that are going to land in our browsers. I want to use them as soon as possible but because they are not well supported everywhere we need a transpiler. Tool that will parse our ES6 code and will produce ES5 version. [Babel](http://babeljs.io/) does the job and plays very well with React. Along with the transpiler we will need a bundler. Something that will resolve the [imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) and will generate only one file containing our application. My choice for that is [webpack](https://webpack.github.io/).

## The base

Before a couple of weeks I created [react-webpack-started](https://github.com/krasimir/react-webpack-starter). It gets JSX file as an input and using Babel generates an ES5 file. We have a local dev server running and a linter but that's another story. If you are interested in the building setup follow [this](http://krasimirtsonev.com/blog/article/a-modern-react-starter-pack-based-on-webpack) article.

Here are the NPM scripts that I was able to run in the beginning:

```
// in package.json
"scripts": {
  "dev": "./node_modules/.bin/webpack --watch --inline",
  "test": "karma start",
  "test:ci": "watch 'npm run test' src/"
}
```
`npm run dev` fires the webpack compilation and the dev server. For testing - [Karma runner](http://karma-runner.github.io/) with Phantomjs. The directory structure that I used is as follows:

```
|
+-- example-es6
|   +-- build
|   |   +-- app.js
|   |   +-- app.js.map
|   +-- src
|   |   +-- index.js
|   +-- index.html
+-- src
    +-- vendor
    |   +-- google.js
    + -- Location.jsx
```

The component that I want to publish is placed in `Location.jsx`. In order to test it I created a simple app (`example-es6` folder) that imports the file.

I spent some time developing the component and finally it was done. I pushed the changes to the [repository](https://github.com/krasimir/react-place) in GitHub and I thought that it is accessible for the huge React community. Well, five minutes later that I realized that it wasn't enough for a couple of reasons:

* If I publish the component as a NPM package I'll need an entry point. Is my JSX file suitable for that? No, it's not because not every developer likes JSX. The component should be distributed in a non-JSX version.
* My code is written in ES6. Not every developer uses ES6 and has a transpiler in its building process. So the entry point should be ES5 compatible.
* The output of webpack indeed satisfies the two points above but it has one problem. What we have is a bundle. It contains the whole React library. We want to bundle the autocomplete widget but not React.

So, webpack is useful while developing but can't generate a file that could be required or imported. I tried using the [externals](https://webpack.github.io/docs/library-and-externals.html) option but that works if we have globally available dependencies.

## Producing ES5 entry point

Defining a new NPM script makes a lot of sense. NPM even [has](https://docs.npmjs.com/misc/scripts) a `prepublish` entry that runs before the package is published and local `npm install`. I continued with the following:

```
// package.json
"scripts": {
  "prepublish": "./node_modules/.bin/babel ./src --out-dir ./lib --source-maps --presets es2015,react"
  ...
}
```

No webpack, just Babel. It gets everything from the `src` directory, converts the JSX to pure JavaScript calls and ES6 to ES5. The result is:

```
|
+-- example-es6
+-- lib
|   +-- vendor
|   |   +-- google.js
|   |   +-- google.js.map
|   +-- Location.js
|   +-- Location.js.map
+-- src
    +-- vendor
    |   +-- google.js
    + -- Location.jsx
```

The `src` folder is translated to plain JavaScript plus source maps generated. An important role here play the presets [`es2015`](https://babeljs.io/docs/plugins/preset-es2015/) and [`react`](https://babeljs.io/docs/plugins/preset-react/).

In theory, from within a ES5 code we should be able to `require('Location.js')` and get the component working. However, if we open the file we will see that there is no `module.exports`. We have only

```
exports.default = Location;

```

Which means that we have to require the library with

```
require('Location').default;
```

Thankfully there is plugin [babel-plugin-add-module-exports](https://www.npmjs.com/package/babel-plugin-add-module-exports) that solves the issue. We may change our script to the following:

```
./node_modules/.bin/babel ./src --out-dir ./lib 
--source-maps --presets es2015,react 
--plugins babel-plugin-add-module-exports
```

## Generating browser bundle

The result of the previous section was a file which may be imported/required by any JavaScript project. Any bundler tool like webpack or [Browserify](http://browserify.org/) will resolve the needed dependencies. The last bit that we have to take care is the case where the developer doesn't use a bundler. Let's say that we want an already generated JavaScript file and we want to add to with a `<script>` tag. We assume that React is already loaded on the page and we need only our component with its autocomplete widget included.

To achieve this we will effectively use the file under the `lib` folder. We mentioned Browserify above so let's use it.

```
./node_modules/.bin/browserify ./lib/Location.js 
-o ./build/react-place.js 
--transform browserify-global-shim 
--standalone ReactPlace
```

`-o` option is used to specify the output file. `--standalone` is needed because we don't have a module system and we need a global access to our component. The interesting bit is `--transform browserify-global-shim`. This is the transform plugin that exclude React but imports the autocomplete widget. To make it work we need to create one more entry in our `package.js`:

```
// package.json
"browserify-global-shim": {
  "react": "React",
  "react-dom": "ReactDOM"
}
```

We specify the names of the global variables that will resolve when we call `require('react')` and `require('react-dom')` from within the component. If we open the generated `build/react-place.js` file we will see:

```
var _react = (window.React);
var _reactDom = (window.ReactDOM);
```

If we talk about a component that is dropped in a `<script>` tag then we should minify the code. In production we should be using a compressed version of the same `build/react-place.js` file. [Uglifyjs](https://www.npmjs.com/package/uglify-js) is a good module for minification. Just after the browserify usage we may add:

```
./node_modules/.bin/uglifyjs ./build/react-place.js 
--compress --mangle 
--output ./build/react-place.min.js 
--source-map ./build/react-place.min.js.map
```

## The result

The final script is a combination of Babel, Browserify and Uglifyjs:

```
// package.json
"prepublish": "
  ./node_modules/.bin/babel ./src --out-dir ./lib --source-maps --presets es2015,react --plugins babel-plugin-add-module-exports && 
  ./node_modules/.bin/browserify ./lib/Location.js -o ./build/react-place.js --transform browserify-global-shim --standalone ReactPlace && 
  ./node_modules/.bin/uglifyjs ./build/react-place.js --compress --mangle --output ./build/react-place.min.js --source-map ./build/react-place.min.js.map
",
```
*(notice that I added few new lines to make the script readable but in the [original package.json](https://github.com/krasimir/react-place/blob/master/package.json#L25) file everything is placed into one line)*

The final directories/files in the project look like the following:

```
|
+-- build
|   +-- react-place.js
|   +-- react-place.min.js
|   +-- react-place.min.js.map
+-- example-es6
|   +-- build
|   |   +-- app.js
|   |   +-- app.js.map
|   +-- src
|   |   +-- index.js
|   +-- index.html
+-- lib
|   +-- vendor
|   |   +-- google.js
|   |   +-- google.js.map
|   +-- Location.js
|   +-- Location.js.map
+-- src
    +-- vendor
    |   +-- google.js
    + -- Location.jsx
```





