# JavaScript: sequencing function calls #2

I created a simple [JavaScript library](https://github.com/krasimir/chain) for running functions in a sequence. The story behind this is published [here](http://krasimirtsonev.com/blog/article/JavaScript-sequencing-function-calls-parallel-functional-chain). Today I made few interesting changes which deserve a new blog post.[STOP]

## Quick overview

The basic usage of the library:

	Chain.run(
	    function(res, next) {
	        console.log("A"); next(10);
	    },
	    function(res, next) {
	        console.log("B", res); next(res+1);
	    },
	    function(res, next) {
	        console.log("C", res); next();
	    }
	);

I.e. there is a *run* method with unlimited number of arguments which are actually functions. Every function accepts result from the previous one (*res*) and callback (*next*). Calling *next* passes the flow to the next function in the list.

## The functional chain pattern

The library uses functional chain pattern already. I.e. you are able to do the following:

	Chain
		.on("done", chainEnds)
		.run(funcA, funcB)
		.off("done", chainEnds)

This is possible because all the methods return actually same object (*Chain* is pointing to the same one). That's a nice pattern, because it saves some time and by my opinion makes the code pretty :). 

Inspired by [(fab)](https://github.com/jed/fab), I decided to improve the library a bit. I.e. the above script is transformed to:

	Chain()
		("done", chainEnds)
		(funcA, funcB)
		("done", chainEnds)

*Chain* is not a global object anymore, but it is a function. I.e. the developers are able to run multiple chains in parallel. *Chain* returns also a function which is called again and again. It checks the number and types of the arguments and decides what to do.

	var process = function() {
		if(arguments.length > 0) {
			// on method
			if(arguments.length === 2 && typeof arguments[0] === 'string' && typeof arguments[1] === 'function') {
				on.apply(self, arguments);
			// run method
			} else {
				run.apply(self, arguments);
			}
		}
		return process;
	}

The *proccess* method makes the following code valid:

	Chain()("done", function() { 
        console.log("chain ends"); 
    })(
        function(res, chain) {
            console.log("A"); chain.next(10);
        },
        function(res, chain) {
            console.log("B", res); chain.next(res+1);
        },
        function(res, chain) {
            console.log("C", res); chain.next();
        }
    );

The output is:

	A
	B 10
	C 11
	chain ends

## Error reporting

[Valeri Bogdanov](https://github.com/vbogdanov) pointed out that the current implementation of [Chain](https://github.com/krasimir/chain) doesn't offer a possibility for error reporting. I.e. you have several functions running one after another, you could pass a parameter between them, but no errors. Of course you can use send something like:

	{
		result: ...
		error: ...
	}

But it's not the best possible solution. So, instead of receiving a callback, Valeri suggested to receive a *chain* object, which has *next* and *error* methods. It is a great idea and I spend some time today working on it. Here is an example, which shows how to pass errors between the functions:

	var operationA = function(res, chain) {
        chain.error({message: "Error message from operation A"}).next();
    }
    var operationB = function(res, chain) {
        chain.error({message: "Error message from operation B"}).next();   
    }
    Chain()("done", function(res, chain) {
        if(errors = chain.error()) {
            console.log("Yes, there are some errors", errors);
        }
    })(
        operationA,
        operationB
    );

Output:

	Yes, there are some errors
	[Object, Object]