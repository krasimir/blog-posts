# JavaScript for loop syntax

As javascript developers we all have to write a lot of for loops. Before a couple of months I saw an alternative syntax, which I really liked. It saves some time and it looks much nicer. However, one of my colleagues reported that this fancy syntax is not working as it should.

Let's say that I have an array of data representing users in a system. What I did before is:

	var users = [
	    { name: "A"},
	    { name: "B"},
	    { name: "C"},
	    { name: "D"},
	    { name: "E"}
	];

There is one additional row var *user = users[i];*. Normally I feel more comfortable if I have *user* instead of *users[i]*. So, the new way:

	for(var i=0; user=users[i]; i++) {
	    // ...
	}

I wrote a question in Stackoverflow and the guys there spotted the problem. This syntax will not work if some of the elements of the array is *falsy*. I.e. if I have:

	var users = [
	    { name: "A"},
	    { name: "B"},
	    false,
	    { name: "D"},
	    { name: "E"}
	];

The loop will stop on the third element, because *user* will be false. We could of course solve this by checking the type of the variable:

	for(var i=0; typeof (user=users[i]) !== "undefined"; i++) {
	   // ...
	}

Even this, is not perfect, because if something is *undefined* we will be in the same situation. 

The conclusion is that we can use the second syntax only if we are 100% sure that our elements are *truly*.