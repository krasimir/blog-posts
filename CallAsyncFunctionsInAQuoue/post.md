# 7 lines JavaScript library for calling asynchronous functions

I was surprised by the good feedback for [JavaScript template engine in just 20 lines](http://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line) and decided to blog for another small utility function which I'm using often. While we are talking about JavaScript in the browser, most of the operations are asynchronous. We are dealing with callbacks all the time and sometimes we end up with awesome callback hell.

Let's say that we have two  functions and we want to call them one after each other. They both operate with same variable. The first one sets its value and the second one uses it.

	var value;
	var A = function() {
		setTimeout(function() {
			value = 10;
		}, 200);
	}
	var B = function() {
		console.log(value);
	}

So, if we now run *A();B();* we will get *undefined* in the console. It's like that because the *A* function sets the value asynchronously. What we could do is to send a callback and execute it once the job is done.

	var value;
	var A = function(callback) {
	  setTimeout(function() {
	    value = 10;
	    callback();
	  }, 200);
	};
	var B = function() {
	  console.log(value);
	};

	A(function() {
	  B();
	});

This works, but imagine what will happen if we need to run five or more methods. Passing callbacks all the time will lead to messy and unpleasant code. 

The idea is to write a helper function which accept our workers and handle the whole process. Let's start with the simplest thing:

	var queue = function(funcs) {
		// magic here
	}

So, what we have to do is to run that function by passing the both *A* and *B* - *queue([A, B])*. We need to get the first function and execute it.

	var queue = function(funcs) {
		var f = funcs.shift();
	    f();
	}

If you run this code you will see an error *TypeError: undefined is not a function*. That's because *A* function doesn't accept callback but it tries to run it. Let's pass one.

	var queue = function(funcs) {
		var next = function() {
			// ...
		};
		var f = funcs.shift();
		f(next);
	};

The *next* method is getting called once *A* finishes its job. That's the perfect place for continuing to the next function in the list. We could arrange the code a bit and we are able to go through the whole array. 

	var queue = function(funcs) {
		var next = function() {
			var f = funcs.shift();
			f(next);
		};
		next();
	};

If we leave the things like that we will reach our goal. I.e. function *A* is called and just after that *B*, which prints the correct value of the variable. The key moment here is the usage of *shift* method. It removes the first element of the array and returns the element. Step by step *funcs* array becomes empty. So, this could lead to an error. To prove this theory, let's assume that we still need to run the both functions, but we don't know their order. In this case, they both should accept callback and execute it.

	var A = function(callback) {
		setTimeout(function() {
			value = 10;
			callback();
	  	}, 200);
	};
	var B = function(callback) {
	  	console.log(value);
	  	callback();
	};

And of course we got *TypeError: undefined is not a function*. To prevent this we should check if the *funcs* array is empty.

	var queue = function(funcs) {
		(function next() {
			if(funcs.length > 0) {
				var f = funcs.shift();
				f(next);
			}
		})();
	};

What I did also is to invoke the *next* function just after its definition. It saves few bytes.

Let's try to cover as many cases as possible. What about the current scope of the executed functions. The *this* keyword inside the functions probably points the global *window* object. It will be cool if we set our own scope.

	var queue = function(funcs, scope) {
	    (function next() {
	          if(funcs.length > 0) {
	              var f = funcs.shift();
	              f.apply(scope, [next]);
	          }
	    })();
	};

We added one more parameter to the tiny library. Later instead of *f(next)* we use the *apply* function, set the scope and pass *next* as a parameter. Pretty much the same thing. 

And the last feature which we need is the ability pass arguments between the functions. Of course we don't have an idea how many parameters will be send. That's why we need to use the *arguments* variable. As you probably know, that variable is available in every JavaScript function and represents the coming parameters. It's something like an array, but not exactly. And because in *apply* method we need to use real array, a little trick is used.


	var queue = function(funcs, scope) {
	    (function next() {
	          if(funcs.length > 0) {
	              var f = funcs.shift();
	              f.apply(scope, [next].concat(Array.prototype.slice.call(arguments, 0)));
	          }
	    })();
	};

And here is the full example which demonstrates all the features of the library.

	var obj = {
	    value: null
	};

	queue([
	    function(callback) {
	        var self = this;
	        setTimeout(function() {
	            self.value = 10;
	            callback(20);
	        }, 200);
	    },
	    function(callback, add) {
	        console.log(this.value + add);
	        callback();
	    },
	    function() {
	        console.log(obj.value);
	    }
	], obj);

If you run this code you will see:

	30
	10

And to match the lines mentioned in the title of this article we could write the main code in only one line:

	var queue = function(funcs, scope) {
	    (function next() {
	          if(funcs.length > 0) {
	              funcs.shift().apply(scope || {}, [next].concat(Array.prototype.slice.call(arguments, 0)));
	          }
	    })();
	};

Here is a JSBin to play with:

<a class="jsbin-embed" href="http://jsbin.com/AhirAlOV/5/embed?js,console">JS Bin</a><script src="http://static.jsbin.com/js/embed.js"></script>