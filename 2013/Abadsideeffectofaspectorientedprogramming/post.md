# A bad side effect of aspect oriented programming 

I just read [this](http://know.cujojs.com/tutorials/aop/intro-to-aspect-oriented-programming#Adding-behavior) very interesting article published on [know.cujojs.com](http://know.cujojs.com/). It's about aspect oriented programming. At the beginning I thought "Oh, that's kinda cool", but when I start thinking about how I'll use it in practice I notice something bad. The blog post itself is well written and informative, but doesn't include any cons of the used technique.

Here is the example used in the published material:

	function Thing() {}
	Thing.prototype.doSomething = function(x, y) {
	    var result;
	    // compute some result using x and y
	    return result;
	};

	// AOP
	var origDoSomething = Thing.prototype.doSomething;
	Thing.prototype.doSomething = function() {
	    var start = Date.now();
	    var result = origDoSomething.apply(this, arguments);
	    console.log((Date.now() - start) + 'ms', x, y, result);
	    return result;
	}

	var thing = new Thing();
	// some time later, and possibly even in
	// another part of the application
	var result = thing.doSomething(x, y);

And its benefits

  - The source code of *Thing* hasn't been modified.
  - The consumers of *Thing* do not need to change.
  - The behavior of the original doSomething, i.e. its contract has been preserved.
  - *Thing* has no knowledge of doSomethingElseFirst, and no dependency on it. Thus, *Thing*'s unit tests do not need to be updated.

It is actually a smart way to add behaviour to your class without touching the implementation of it. You do this without changing even a line of code. 

However, if you imagine the real useage you will probably spot the problem. There is a modification of your function which is kinda hidden. If the new version of your method is not placed exactly below the original one will be difficult to find out that exists. If there is any problem with the new behaviour you will probably start looking at the class and its methods. You will put some *console.logs*, but everything will look ok, because real problem is outside the class. If you use aspect oriented programming I'll suggest to put a comment inside the original function explaining that this method is changed from the outside. Something like that:

	function Thing() {}
	Thing.prototype.doSomething = function(x, y) {
		// ---> (AOP): modified from /lib/aop/profiler.js:243 
	    var result;
	    // compute some result using x and y
	    return result;
	};
