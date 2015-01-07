# Fun playing with npm, dependencies and postinstall script

I like [npm](https://npmjs.org/) and the fact that I can install tons of stuff. It's great piece of software and helps me solve problems everyday. Yesterday I had to use a [`postinstall`](https://docs.npmjs.com/misc/scripts) script and hit a problem.

## The problem

Let's say that we have a module `A` that depends on module `B`. We have a `package.json` file like the one below:

```js
{
  "name": "A"
  "version": "0.1.2",
  "dependencies": {
    "B": "0.1.2"
  }
}
```

When we run `npm install` we will get the following files/folder structure:

```
├── node_modules
│   └── B
├── package.json
└── README.md
```

Now, let's say that the both `A` and `B` depend on another `C` module. And not only that, they depend on same version of the module. Now it gets interesting. `npm` is smart enough to find out that `C` module should be installed on only one place and used equally by `A` and `B`. So it does the following:

```
├── node_modules
│   ├── B
│   │   ├── node_modules
│   │   └── package.json
│   └── C   
├── package.json
└── README.md
```

Everything seems ok. The `C` module is installed at the same level of `B` but `B` still has an access to it through `require('C')`. I believe that `npm` first checks in the local `node_modules` directory and the goes up and at the end checks the globally installed packages (not sure if that's the order). 

My problem is that I have a `postinstall` script in `node_modules/B/package.json` that uses the `C` module. Something like this:

```js
{
  "name": "B"
  "version": "0.1.2",
  "dependencies": {
    "C": "0.0.1"
  },
  "scripts": {
    "postinstall": "node ./node_modules/C make"
  }
}
```

And of course after the installation the `B` module does not have `C` installed locally. It's in the upper directory.

## The solution

The first thing that I tried is accessing the `C` module from a script and not directly like in the `package.json` above. For example:

```js
// B/runMe.js file
var C = require('C');
C.make();
```

And I replaced `"postinstall": "node ./node_modules/C make"` with `"postinstall": "node ./runMe.js"`.

That doesn't work because the `C` module was not installed even in the upper directory when `npm` runs `node ./runMe.js`. We need to wait a bit. In the end I just write the most hacky code for the day:

```js
// B/runMe.js file
var deps = ['C'], index = 0;
(function doWeHaveAllDeps() {
  if(index === deps.length) {
    var C = require('C');
    C.make();
    return;
  } else if(isModuleExists(deps[index])) {
    index += 1;
    doWeHaveAllDeps();
  } else {
    setTimeout(doWeHaveAllDeps, 500);
  }
})();

function isModuleExists( name ) {
  try { return !!require.resolve(name); }
  catch(e) { return false }
}
```

I described all the needed dependencies in an array and simply wait till they are accessible via `require.resolve`. Dummy but it worked. 




