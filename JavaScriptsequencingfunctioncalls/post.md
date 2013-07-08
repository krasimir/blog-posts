# JavaScript: sequencing function calls 

While I'm working on [Auxilio](https://github.com/krasimir/auxilio) I end up in a sitatuation where I have to call few javascript functions in a sequence. It's an interesting how this could be solved and I'll be happy if you share your approach for such problem.[STOP]

(The source code of the developed class is available here [https://github.com/krasimir/chain](https://github.com/krasimir/chain))

[Auxilio](https://github.com/krasimir/auxilio) supports something which I call *scripting*. I.e. it allows the developers to write their own js scripts and run them in the context of Chrome. The extension offers [a bunch of helper global methods](https://github.com/krasimir/auxilio/blob/master/commands.md) and ability to write your [own commands](https://github.com/krasimir/dotfiles/tree/master/auxilio/profile). For example:

	cd("D:/work/projects"); // changes the current directory
	ci("little fix"); // git commits the current changes with a message = little fix
	push("master"); // push the commit to branch master

That's cool and saves a lot of time. However, after few weeks using the extension I've written a lot of scripts and it looks like I'll continue writing more. The problem is that I don't like how the code looks like. It has a lot of sugar around it. The real functional code of the above example looks like that:

	function MyScriptForUpdating(args, callback) {
		var message = args.join(" ");
		cd("D:/work/projects", function() {
			ci(message, function() {
				push("master", callback);
			})
		})
	}

Not very nice! The first thing that you will notice is that there is a *callback* passed in every function call. That's mandatory and it is deeply integrated in the architecture of [Auxilio](https://github.com/krasimir/auxilio). Especially when you are executing commands like *git push*. There is a chain of functions and each other should wait till the previous one does its job. Most of the predefined methods return data and probably the developer will need this information. That's how every script works as well. There is a callback as a second argument and this function should be called no matter what.

I have external js files which contain more then 10 nested functions. It doesn't look good for sure. So, I started thinking about a simple class which will save me some time and will make my code much cleaner. Here are the requirements:

  - it should accept an array of functions
  - it should run them sequencely
  - it should allow parameter sending from one command to the other
  - it should have a callback indicating that all the methods are called

Very often, when I'm designing an API, I'm writing few lines of code which actually use the API. Doing this I'm able to see how the real use looks like. Based on the points above I started with this:

	Chain([
		function() { },
		function() { },
		function() { }
	])

That's not bad, but passing the array as an argument of a function is kinda restricting. I like the [revealing module pattern](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#revealingmodulepatternjavascript) and decided to use it here. The above piece of code became:

	Chain.run([
		function() { },
		function() { },
		function() { }
	])

At this moment I realized the there is no need to send an array. I could just pass the functions as parameters and after that use *arguments* to fetch them one by one.

	Chain.run(
		function() { },
		function() { },
		function() { }
	)
	...
	var run = function() {
		for(var i=0; func=arguments[i]; i++) {
			func();
		}
	}

The usage of revealing module pattern allows me to implement the [observer pattern](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#observerpatternjavascript). I.e. to add a handler for the end of the functional chain.

	Chain
		.on("done", function() {
			console.log("end");
		}).run(
			function() { },
			function() { },
			function() { }
		)

Every closure which I'm adding to the queue will have two arguments - the result of the previous function and callback.

	Chain
		.on("done", function(re) {
			console.log("end");
		}).run(
			function(res, next) { },
			function(res, next) { },
			function(res, next) { }
		)

If the *next* method is not called the script stops.

So far, so good. I know how my API should look like and I can start coding. Here is the first version of the run method:

	var Chain = (function() {

		var _resultOfPreviousFunc = null,
			self = this;

		var run = function() {
			if(arguments.length > 0) {
				var funcs = [];
				for(var i=0; f=arguments[i]; i++) funcs.push(f);
				var element = funcs.shift();
				if(typeof element === 'function') {
					element(_resultOfPreviousFunc, function(res) {
						_resultOfPreviousFunc = res;
						run.apply(self, funcs);
					})
				}
			} else {
				// indicate end of the chain
			}
			return api;
		}

		return api = {
			run: run
		}

	})();

What is coming to every javascript function, i.e. the *arguments* object, is not exactly an array. It doesn't have *shift* method, so I simply create a real array and add all the sent functions there. After that the first method of the newly array is fetched and called. In its callback the run method is fired again. The process continues till there is no more commands.

Later I decided that I don't want to write *function(res, next) { ... }* all the time. It will be nice if I can type something like:

	Chain.run(
		[cd, "D:/work/projects"],
		[ci, "little fix"],
		[push, "master"]
	)

Every of my functions have a callback at the end and accept unknown number of arguments. I.e.:

	var cd = function(path, callback) {
		...
	}
	var push = function(branch, remote, callback) {

	}

The following piece of code covers this use case:

	if(typeof element === 'function') {
		...
	} else if(typeof element === 'object' && element.length > 0) {
		var f = element.shift();
		var callback = function(res) {
			_resultOfPreviousFunc = res;
			run.apply(self, funcs);
		}
		f.apply(f, element.concat([callback]));
	}

I know that the first element of the provided array is the function which I have to call. Every thing after that is actually parameter to the function. There is no callback added, so I have to write that by myself. At the end simple attach the callback to the arguments send to the command. The problem in this implementation is that I can't get the result of the previous command. It could be done like that:

	f.apply(f, element.concat([_resultOfPreviousFunc, callback]));

But this means that every function will receive at least two arguments no matter what. And I had commands which accept only a callback.

Here is the full source code of the class containing the observer pattern logic.

	var Chain = (function() {

		var _listeners = {},
			_resultOfPreviousFunc = null,
			self = this,
			api = {};

		var on = function(type, listener) {
			if(!_listeners[type]) _listeners[type] = [];
			_listeners[type].push(listener);
			return api;
		}
		var off = function(type, listener) {
			if(_listeners[type]) {
				var arr = [];
				for(var i=0; f=_listeners[type][i]; i++) {
					if(f !== listener) {
						arr.push(f);
					}
				}
				_listeners[type] = arr;
			}
			return api;
		}
		var dispatch = function(type, param) {
			if(_listeners[type]) {
				for(var i=0; f=_listeners[type][i]; i++) {
					f(param);
				}
			}
		}
		var run = function() {
			if(arguments.length > 0) {
				var funcs = [];
				for(var i=0; f=arguments[i]; i++) funcs.push(f);
				var element = funcs.shift();
				if(typeof element === 'function') {
					element(_resultOfPreviousFunc, function(res) {
						_resultOfPreviousFunc = res;
						run.apply(self, funcs);
					})
				} else if(typeof element === 'object' && element.length > 0) {
					var f = element.shift();
					var callback = function(res) {
						_resultOfPreviousFunc = res;
						run.apply(self, funcs);
					}
					f.apply(f, element.concat([callback]));
				}
				
			} else {
				dispatch("done", _resultOfPreviousFunc);
			}
			return api;
		}

		return api = {
			run: run,
			on: on,
			off: off
		}

	})();

The code above is also available in GitHub [here](https://github.com/krasimir/chain), so feel free to fork it and let me know if you have any ideas how to improve it.