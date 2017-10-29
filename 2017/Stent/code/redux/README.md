# React Bare Minimum

A bare minimum setup to work with react. Compiling and bundling, nothing else.

* It compiles ES6 code containing JSX syntax
* It bundles your code to a single JavaScript file
* There is a watcher running above two when you change a file
* That's it all folks

---

*I'm sick of copy-pasting files and configuring when writing blog posts related to React. I just wanted something small which I download and start using.*

---

## How to use it

Just download the package. I don't see much of value in using `npm i react-bare-minimum` because the idea is to use it as a working directory.

Once you have the files, run `npm i` (or `yarn install`).

* `npm run build` (`yarn build`) for building the project once
* `npm run watch` (`yarn watch`) for run the watcher

When the build finishes check out the `public` folder. There is an `index.html` file and your bundled `app.js`.

## Dependencies

* `babel-core`
* `babel-preset-es2015`
* `babel-preset-react`
* `babelify`
* `browserify`
* `react`
* `react-dom`
* `watchify`

## Misc

[The bare minimum to work with React article](http://krasimirtsonev.com/blog/article/The-bare-minimum-to-work-with-React)