# Distributing React components

I'm working with React daily and really want to share my experience. While I was open sourcing [react-place](https://github.com/krasimir/react-place) I noticed that there is some complexity around preparing the component for releasing. I decided to document it here. A few steps that I took once the component was ready. You may be surprised but writing the working `jsx` file doesn't mean that the component is ready for publishing and is usable for the other developers.

## The component

[react-place](https://github.com/krasimir/react-place) is a component that renders an input field. The user starts typing a city name and the component makes predictions/suggestions. The component accepts a property called `onLocationSet`. It is fired once the user selects some of the suggestions. The function receives an object containing short description and geo coordinates of the city. We have a communication with external API (Google maps) and a hard dependency involved (autocomplete widget). Let's see how the development went and why after finishing the component it wasn't ready for publishing.

## Toolset

There are few things which are at the top of the wave right now. One of them is React and its [JSX syntax](https://facebook.github.io/react/docs/jsx-in-depth.html). Another one is the new ES6 spec and all these goodies that are going to land in our browsers. I want to use them as soon as possible but because they are not well supported everywhere we need a transpiler. [Babel](http://babeljs.io/) plays very well with React. So Babel will compile the JSX and ES6 files to plain ES5 JavaScript. However, we need a bundler too. A tool that will resolve the [imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) and will output a single file. My choice for that is [webpack](https://webpack.github.io/). 

Before a couple of weeks I created [react-webpack-started](https://github.com/krasimir/react-webpack-starter). It gets JSX file and thankfully to Babel generates an ES5 file. We have a local dev server running and a linter but that's another story. If you are interested in the building setup follow [this](http://krasimirtsonev.com/blog/article/a-modern-react-starter-pack-based-on-webpack) article.

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
|    +-- index.html
+-- src
    +-- vendor
    |   +-- google.js
    + -- Location.jsx
```

I spent some time developing the component and finally it was done. I pushed the changes to the [repository](https://github.com/krasimir/react-place) in GitHub and I thought that it is accessible for the huge React community. Well, that wasn't enough for a couple of reasons:

* If I publish the component as a NPM package I'll need an entry point. Is my JSX file suitable for that? No, it's not because not every developer likes JSX. The component should be distributed in a non-JSX version.
* My code is written in ES6. Not every developer uses ES6 and has a transpiler in its building process. So the entry point should be ES5 compatible.
* The output of webpack indeed satisfies the two points above but it has one problem. What we have is a bundle. It contains the whole React library. That's not exactly what we want. We want to bundle the autocomplete widget but not React.

So, webpack is useful while developing but can't generate a file that could be required or imported. I tried using the [externals](https://webpack.github.io/docs/library-and-externals.html) option but that works if we have globally available dependencies. 

I like to use NPM as a task runner so defining a new script makes a lot of sense. NPM even [has](https://docs.npmjs.com/misc/scripts) a `prepublish` entry that runs before the package is published and local `npm install`.

```
// package.json
"scripts": {
  "prepublish": "./node_modules/.bin/babel ./src --out-dir ./lib --source-maps --presets es2015,react
}
```







