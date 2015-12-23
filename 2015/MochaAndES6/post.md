# Using Mocha with ES6 spec files

The new ES6 specification of JavaScript simply works better for me. It helps expressing my ideas in a shorter and cleaner way. So, I want to write ES6 everywhere. Even while I'm testing my applications.

As a testing framework I like using [Mocha](http://mochajs.org/). There are tons of plugins for it and the reporters are nice. The problem is that it doesn't accept ES6 written JavaScript out of the box. We need some setup before that. Here is how the process looked like so far:

```
           spec files written in
           plain ES5 JavaScript
             |
             |
mocha ---> reading the files and
           running the tests
             |
             |
           test results
```

However, if I write my tests in ES6 this doesn't work anymore because Mocha don't understand the input. 

The best transpiler of ES6 to ES5 is [Babel](http://babeljs.io/). And that's what I used at the end. The script that I added to my `package.json` file looked like that:

```
// package.json
"scripts": {
  "test": "mocha --compilers js:babel-core/register ./test/**/*.spec.js"
}
```

The final bit was adding a `.babelrc` file to my root directory. As you may guess this is a configuration file for babel. The latest versions of the transpiler are no longer bundled with compilers by default. We need to install and use them separately. 

```
// .babelrc
{
  "presets": ["es2015"]
}
```

Once we run `mocha` in the terminal we get the following:

```
           spec files written in
           plain ES6 JavaScript
             |
             |
mocha ---> reading the files
             |
babel ---> compiles the files
           from ES6 to ES6
             |            
mocha ---> running the tests
             |
             |
           test results
```

And here is the full list of dependencies:

```
// package.json
"devDependencies": {
  "babel": "6.3.13",
  "babel-core": "6.1.18",
  "babel-preset-es2015": "6.3.13",
  "mocha": "2.3.4"
  ...
}
```

*Notice the versions of babel and mocha. If you come to this article after a month you may see the API of these two modules changed.*
