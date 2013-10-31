# JavaScript: dependency free extend method

While I worked on [AbsurdJS](krasimir.github.io/absurd) I needed a function which accepts numerous objects and combines their properties. I.e. something like the *[_.extend](http://underscorejs.org/#extend)* method of UnderscoreJS. What I did is actually to use one more dependency just because of such method. [John-David Dalton](https://github.com/jdalton) nicely pointed out my mistake and added a simple function which solved the problem. I change it a bit and now it acts as UnderscoreJS's version.

	var extend = function() {	
		var process = function(destination, source) {	
		    for (var key in source) {
				if (hasOwnProperty.call(source, key)) {
				    destination[key] = source[key];
				}
		    }
		    return destination;
		};
		var result = arguments[0];
		for(var i=1; i<arguments.length; i++) {
			result = process(result, arguments[i]);
		}
		return result;
	};

Here is a short [Jasmine](https://github.com/pivotal/jasmine) test:

	describe("Testing utils /", function() {

		it("should use extend", function(done) {
			expect(extend).toBeDefined();
			var o = {prop: 10};
			o = extend(o, { prop: 20 }, { prop: 30, name: "Extend" }, { prop: 40, address: "Bla Bla" });
			expect(o.name).toBeDefined();
			expect(o.address).toBeDefined();
			expect(o.prop).toBe(40);
			done();
		});

	});

The resulted *o* object has the following value:

	{
		prop: 40, 
		name: "Extend", 
		address: "Bla Bla"
	}
