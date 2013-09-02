# JavaScript: creating class based on object 

I'm very happy visiting [Stackoverflow](http://stackoverflow.com/users/642670/krasimir) more often then Facebook these days. Today I landed on [this question](http://stackoverflow.com/questions/18519098/how-to-convert-object-literal-to-function/18546077). I'm not sure that I understand the real context of the situation, but I found something helpful, which may help you. What if we have an object and want to use it as a base for JavaScript class (i.e. function). The idea is to create instances and basically extend the original object.

Let's start with the object. Here is what we have:

	var object = {
	    a: 2,
	    b: function(){
	         return this.a;
	    }
	}

So, at the end we should be able to create other objects which have property *a* and method *b*.

	var ob1 = Class1();
	ob1.a = 10;
	var ob2 = Class2();
	ob2.a = 20;
	console.log(ob1.b(), ob2.b()); // 10 20

There are tons of articles about [extending in JavaScript](http://krasimirtsonev.com/blog/article/JavaScript-is-cool-modular-programming-extending#extending-modules). However, most of them rely on the fact that you have a function as base class. And by coping prototype, the inheritance is a pretty common task. It is interesting how this could be achieved if we have an object as base. I started with a simple extend function:

	var extend = function(obj) {
	    return function() {
	        // ...
	    }
	};

It should accept an object and return a function. Later, every function's call should create a new instance, i.e. a new object. If we type

	var extend = function(obj) {
	    return function() {
	        return obj;
	    }
	};

we will get same object again and again. One possible solution is to copy the passed parameter property by property, but this also means that we may end up with imperfect code. Thankfully, there is a method which provides this functionality - *Object.create*.

	var extend = function(obj) {
	    return function() {
	        return Object.create(obj);
	    }
	};

And here is the final code:

	var Class1 = extend(object);
	var ob1 = Class1();
	ob1.a = 10;

	var Class2 = extend(object);
	var ob2 = Class2();
	ob2.a = 20;

	console.log(ob1.b(), ob2.b()); // 10 20