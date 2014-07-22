# Dependency injection in JavaScript

I like the quote that the programming is all about managing complexity. Maybe you've heard that the computer world is a giant construction of abstractions. We simply wrap things and produce new tools over and over again. Just think for a minute. The languages which you use have build-in functionalities and they are probably abstracted functions of other low level operations. It's the same with [JavaScript](http://krasimirtsonev.com/blog/category/JavaScript). [STOP]Sooner or later you need to use abstractions made by other developers. I.e. you depend on someone's other code. I like the dependency-free modules, but that's kinda difficult to achieve. Even if you create those nice black-box liked components you still have a part which combines everything. That's where the dependency injection placed in. The ability to manage the dependencies effectively is absolutely necessary nowadays. This articles sums up my observations on the problem.

## The goal

Let's say that we have two modules. The first one is a service which makes Ajax requests and the second one is a router.

	var service = function() {
	    return { name: 'Service' };
	}
	var router = function() {
	    return { name: 'Router' };
	}

We have another function which needs these modules.

	var doSomething = function(other) {
	    var s = service();
	    var r = router();
	};

And to make the things a little bit more interesting the function needs to accept one more parameter. Sure, we could use the above code, but that's not really flexible. What if we want to use `ServiceXML` or `ServiceJSON`. Or what if we want to mockup some of the modules for testing purposes. We can't just edit the body of the function. The first thing which we all come up with is to pass the dependencies as parameters to the function. I.e.:

	var doSomething = function(service, router, other) {
		var s = service();
	    var r = router();
	};

By doing this we are passing the exact implementation of the module which we want. However this brings a new problem. Imagine if we have `doSomething` all over our code. What will happen if we need a third dependency. We can't edit all the function's calls. So, we need an instrument which will do that for us. That's what dependency injectors are trying to solve. Let's write down few goals which we want to achieve:

  - we should be able to register dependencies
  - the injector should accept a function and should return a function which somehow gets the needed resources
  - we should not write a lot, we need short and nice syntax
  - the injector should keep the scope of the passed function
  - the passed function should be able to accept custom arguments, not only the described dependencies

A nice list isn't it. Let's dive in.

## The [requirejs](http://requirejs.org/) / [AMD](http://requirejs.org/docs/whyamd.html) approach

You probably already know about [requirejs](http://requirejs.org/). It's a nice variant for solving dependencies.

	define(['service', 'router'], function(service, router) {	    
	    // ...
	});

The idea is firstly to describe the needed dependencies and then write your function. The order of the arguments is of course important here. Let's say that we will write a module called `injector` which will accept the same syntax.

	var doSomething = injector.resolve(['service', 'router'], function(service, router, other) {
	    expect(service().name).to.be('Service');
	    expect(router().name).to.be('Router');
	    expect(other).to.be('Other');
	});
	doSomething("Other");

<i>Before to continue I should clarify the body of the `doSomething` function. I'm using [expect.js](https://github.com/LearnBoost/expect.js) as a assertion library just to be sure that the code which I'm writing works as I want. A little bit TDD approach.</i>

Here is what our `injector` module starts from. It's good to be a singleton, so it does its job from different parts of our application.

	var injector = {
	    dependencies: {},
	    register: function(key, value) {
	        this.dependencies[key] = value;
	    },
	    resolve: function(deps, func, scope) {
	              
	    }
	}

Really simple object which has two functions and one variable which acts as a storage. What we have to do is to checks the `deps` array and search for answers in the `dependencies` variable. The rest is just calling the `.apply` method against the past `func` parameter.

	resolve: function(deps, func, scope) {
        var args = [];
        for(var i=0; i<deps.length, d=deps[i]; i++) {
            if(this.dependencies[d]) {
                args.push(this.dependencies[d]);
            } else {
                throw new Error('Can\'t resolve ' + d);
            }
        }
        return function() {
            func.apply(scope || {}, args.concat(Array.prototype.slice.call(arguments, 0)));
        }        
    }

If there is any scope it is effectively used. `Array.prototype.slice.call(arguments, 0)` is necessary to transform the `arguments` variable to an actually array. So far so good. Our test passes. The problem with this implementation is that we have to write the needed components twice and we can't really mix their order. The additional custom parameters are always after the dependencies.

## The reflection approach

According to Wikipedia *reflection* is the ability of a program to examine and modify the structure and behaviour of an object at runtime. With simple words, in the context of JavaScript, that's reading the source code of an object or function and analyzing it. Let's get our `doSomething` function from the beginning. If you log `doSomething.toString()` you will get the following string:

	"function (service, router, other) {
		var s = service();
	    var r = router();
	}"

Having the method as a string gives us the ability to fetch the expected parameters. And, which is more important, their names. That's what [Angular](http://angularjs.org/) uses for its dependency injection implementation. I cheated a bit and got the regular expression which exports the arguments directly from the Angular's code.

	/^function\s*[^\(]*\(\s*([^\)]*)\)/m

We could change the `resolve` class to the following:

	resolve: function() {
        var func, deps, scope, args = [], self = this;
        func = arguments[0];
        deps = func.toString().match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1].replace(/ /g, '').split(',');
        scope = arguments[1] || {};
        return function() {
            var a = Array.prototype.slice.call(arguments, 0);
            for(var i=0; i<deps.length; i++) {
                var d = deps[i];
                args.push(self.dependencies[d] && d != '' ? self.dependencies[d] : a.shift());
            }
            func.apply(scope || {}, args);
        }        
    }

We run the RegExp against the function's definition. The result is:

	["function (service, router, other)", "service, router, other"]

So, we need only the second item. Once we clean up the empty spaces and split the string we got the `deps` array filled. There is one more change:

	var a = Array.prototype.slice.call(arguments, 0);
	...
	args.push(self.dependencies[d] && d != '' ? self.dependencies[d] : a.shift());

We are looping through the dependencies and if there is something missing we are trying to fetch it from the `arguments` object. Thankfully the `shift` method returns simply `undefined` if the array is empty. It's not throwing an error. The new version of the `injector` could be used like that:

	var doSomething = injector.resolve(function(service, other, router) {
	    expect(service().name).to.be('Service');
	    expect(router().name).to.be('Router');
	    expect(other).to.be('Other');
	});
	doSomething("Other");

No double writing of the dependencies and we could mix their order. It still works and we replicated the Angular's magic.

However, the world is not perfect and there is one very big problem with that reflection type of injection. The minification will break our logic. That's because it changes the names of the parameters and we will not be able to resolve the dependencies. For example:

	var doSomething=function(e,t,n){var r=e();var i=t()}

That's our `doSomething` function passed to a compressor. The solution proposed by Angular's team looks like that:

	var doSomething = injector.resolve(['service', 'router', function(service, router) {
	    
	}]);

It looks like the thing which we started with. I personally wasn't able to find a better solution, and decided to mix the two approaches. Here is the final version of the injector.

	var injector = {
	    dependencies: {},
	    register: function(key, value) {
	        this.dependencies[key] = value;
	    },
	    resolve: function() {
	        var func, deps, scope, args = [], self = this;
	        if(typeof arguments[0] === 'string') {
	            func = arguments[1];
	            deps = arguments[0].replace(/ /g, '').split(',');
	            scope = arguments[2] || {};
	        } else {
	            func = arguments[0];
	            deps = func.toString().match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1].replace(/ /g, '').split(',');
	            scope = arguments[1] || {};
	        }
	        return function() {
	            var a = Array.prototype.slice.call(arguments, 0);
	            for(var i=0; i<deps.length; i++) {
	                var d = deps[i];
	                args.push(self.dependencies[d] && d != '' ? self.dependencies[d] : a.shift());
	            }
	            func.apply(scope || {}, args);
	        }        
	    }
	}

The `resolve` method accepts two or three parameters. If they are two it acts like we wrote it lately. However, if there are three arguments it gets the first one, parse it and fills the `deps` array. Here is the test case:

	var doSomething = injector.resolve('router,,service', function(a, b, c) {
	    expect(a().name).to.be('Router');
	    expect(b).to.be('Other');
	    expect(c().name).to.be('Service');
	});
	doSomething("Other");

You will probably notice that there are two commas one after each other. That's not a typo. The empty value actually represents the `"Other"` parameter. That's how we will be able to control the order of the parameters.

## Injection directly into the scope

Sometimes I'm using a third variant of injection. It involves a manipulation of the function's scope (or with other words, the `this` object). So, it is not always appropriate.

	var injector = {
	    dependencies: {},
	    register: function(key, value) {
	        this.dependencies[key] = value;
	    },
	    resolve: function(deps, func, scope) {
	        var args = [];
	        scope = scope || {};
	        for(var i=0; i<deps.length, d=deps[i]; i++) {
	            if(this.dependencies[d]) {
	                scope[d] = this.dependencies[d];
	            } else {
	                throw new Error('Can\'t resolve ' + d);
	            }
	        }
	        return function() {
	            func.apply(scope || {}, Array.prototype.slice.call(arguments, 0));
	        }        
	    }
	}

All we do is to attach the dependencies to the scope. The benefits here are that the developer should not write the dependencies as parameters. They are just part of the function's scope.

	var doSomething = injector.resolve(['service', 'router'], function(other) {
	    expect(this.service().name).to.be('Service');
	    expect(this.router().name).to.be('Router');
	    expect(other).to.be('Other');
	});
	doSomething("Other");

## Final words

The dependency injection is one of those things which we all do, but never think of. Even if you didn't hear about the term you probably use it million of times. 

All the examples mentioned in this article could be seen [here](https://github.com/krasimir/blog-posts/tree/master/JavaScriptDependencyInjection).