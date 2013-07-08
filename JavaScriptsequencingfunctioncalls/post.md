# JavaScript: sequencing function calls 

While I'm working on [Auxilio](https://github.com/krasimir/auxilio) I end up in a sitatuation where I have to call few javascript functions in a sequence. It's an interesting how this could be solved and I'll be happy if you share your approach for such problem.[STOP]

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