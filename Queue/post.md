# JavaScript challenge: queue implementation

I'm currently working on an animation-heavy web application. There are long chains of CSS transitions/animations, which I have to do. I wrote this little library, because I needed something lightweight with minimalistic API. I think that it deserves its own [repository](https://github.com/krasimir/queue) and I created one.

## The problem

One of the widely used methods for applying [CSS transitions or animations](http://krasimirtsonev.com/blog/article/Introduction-to-animations-in-HTML-css3-transitions-keyframes) is by adding/removing CSS classes. So, here is some pseudo code:

	var logo = $(".logo");
	var banner = $(".banner");
	setTimeout(function() {
		logo.addClass("move-it");
	}, 1000);
	setTimeout(function() {
		logo.removeClass("move-it");
		banner.addClass("colorize");
	}, 2400);
	setTimeout(function() {
		banner.removeClass("colorize");
	}, 3500);

So, it works, but it's a little bit dummy and ugly. A lot of code. If we add more actions we will end up with complex calculations of the times. Also it is difficult to control the whole animation. For example, what if I want to stop it. As you can see I'm using jQuery, so the first logical move is to involve the *queue* function. Something like this may work:

	$( "div" )
	.delay(1000)
	.queue(function(next) {
	    logo.addClass("red");
	    next();
	})
	.delay(1400)
	.queue(function(next) {
	    logo.removeClass("red");
	    banner.addClass("green");
	    next();
	})
	.delay(1100)
	.queue(function(next) {
	    banner.removeClass("green");
	    next();
	});

This looks a little bit better, because the timing is clear enough. However there are still some syntax sugar, like *next*, *queue* and *delay*. Again the stopping of the animations is a little bit tricky. Also I need to use a jQuery object to start from, which looks weird. So, I spend some time and I wrote [queue library](https://github.com/krasimir/queue).

## The library

Very often before to start writing something I first imagine the API. I mean I simply wrote the real use case just to see how the things look. This time, I wanted to use the [chain pattern](http://krasimirtsonev.com/blog/article/JavaScript-sequencing-function-calls-parallel-functional-chain) and avoid writing methods like *delay* and *queue*. 

	queue()(func1)(2000)(func2)();

The code should run *func1*, waits for two seconds and run *func2*. What is happening is that I have a method called *queue* which returns a function. That function returns itself, so I'm able to call it again and again. I have another experiment using the same approach. It's available [here](http://krasimirtsonev.com/blog/article/JavaScript-sequencing-function-calls-parallel-functional-chain-2) and if you are interested you may check it. The first draft of the library looks like that:

	var queue = function() {
	    var api = function() {
	        // ...
	        return api;
	    }
	    return api;
	}

In theory, every call of the *api* function should add elements to the queue. At the end, calling the same function without parameters will run the sequence. The key moment in this pattern is the number and type of the arguments. So, the next step is to distinguish the filling of the queue from its processing.

	var queue = function() {
	    var api = function() {
	        if(arguments.length === 0) {
	            // processing
	        } else {
	            // fill the queue
	        }
	        return api;
	    }
	    return api;
	}

Let's start with the filling. We need the first argument added to an array.

	var filling = function() {
		var item = arguments[0];
		queueElements.push(item);
	}

First, I didn't care about the type of the argument. But later I decided to implement features like stopping of the execution or looping the whole queue. And because I have only one function I deiced to accept three types of parameters:

  - function - function which will be called
  - number - a delay
  - string - everything else

A possible implementation may look like that:

	var	queueElements = [];
	var flags = {};
	var filling = function() {
		var item = arguments[0];
		if(isNumber(item) || typeof item === 'function') {
			queueElements.push(item);
		} else if(typeof item === 'string') {
			flags[item] = arguments[1] || true;
		}
	}

The flags object is filled with properties, which are later used in the processing of the queue. For example to loop the whole chain:

	queue()(func1)(2000)(func2)("loop")();

The values in the *flag* object are either *true* or the second passed parameter. Writing the things like that, I was able to create *on-end* callback.

	queue()(func1)(2000)(func2)("callback", function() {
		// called once the queue is empty
	})();

Processing is just going through every element of the queue. If it's a number a *setTimeout* is added. If it's a function is just called directly. 

	var processing = function() {
		if(queueElements.length > 0) {
			var item = queueElements.shift();
			if(isNumber(item)) { // delay
				setTimeout(api, item);
			} else if(typeof item === 'function') { // functions
				item();
				api();
			}
		} else {
			// queue is empty
		}	
	}

To simplify the code I used the *shift* method. It removes the first element of the array and returns it. If *queueElements.length* is equal to 0 then everything is processed. 

## Final result

At the end the library supports looping, stopping and calling a function at the end.

### Loop the queue

	queue()(func1)(2000)(func2)("loop")();

Have in mind that you may call *("loop")* in the beginning too.

### Stopping 

	var q = queue()(func1)(2000)(func2)();
	q("stop");

### Calling a function once there are no elements in the queue:

	queue()(func1)(2000)(func2)("callback", function() {
		// called once the queue is empty
	})();

And here is the final implementation:

	var queue = function() {
		var api = null, self = this;
		var	queueElements = [], queueElementsSource = [];
		var	isNumber = function(n) { return !isNaN(parseFloat(n)) && isFinite(n); };
		var flags = {}, interval = null;
		var processing = function() {
			if(queueElements.length > 0) {
				var item = queueElements.shift();
				if(flags.stop !== true) {
					if(isNumber(item)) { // delay
						interval = setTimeout(api, item);
					} else if(typeof item === 'function') { // functions
						item();
						api();
					}
				} else {
					clearTimeout(interval);
				}
			} else {
				if(typeof flags.callback !== 'undefined') flags.callback();
				if(flags.loop) {
					queueElements = [];
					for(var i=0; el=queueElementsSource[i]; i++) {
						queueElements.push(el);
					}
					api();
				}
			}	
		}
		var filling = function() {
			var item = arguments[0];
			if(isNumber(item) || typeof item === 'function') {
				queueElements.push(item);
				queueElementsSource.push(item);	
			} else if(typeof item === 'string') {
				flags[item] = arguments[1] || true;
			}
		}
		return api = function() {
			arguments.length === 0 ? processing() : filling.apply(self, arguments);
			return api;
		}
		return api;
	}

The library may be used as a front-end helper, but also as a Nodejs module. Check out the repository in GitHub here [https://github.com/krasimir/queue](https://github.com/krasimir/queue).