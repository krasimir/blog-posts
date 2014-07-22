# Extending Jasmine (BDD framework for testing)

Don't get me wrong, [Jasmine](http://pivotal.github.io/jasmine/) is a wonderful framework. I'm using it for testing JavaScript in both places - front-end (in browser) and back-end (Nodejs). However, the client side has some disadvantages, which I just fixed. I hope that someday these changes will be moved to the official version (or at least I'll make a pull request very soon).[STOP]

## Controlling the rendering. I.e. patching the HtmlReporter.

Here is the typical initialization code for a test suite, which uses Jasmine.

	var jasmineEnv = jasmine.getEnv();
	var htmlReporter = new jasmine.HtmlReporter();
	jasmineEnv.updateInterval = 1000;
	jasmineEnv.addReporter(htmlReporter);
	jasmineEnv.specFilter = function(spec) {
		return htmlReporter.specFilter(spec);
	};
	window.onload = function() {
		jasmineEnv.execute();
	}

The framework generates nice markup showing the results of the tests. It works like a charm, but I can't tell to Jasmine where exactly to place the output. After a short digging in the source code I found the following lines:

	jasmine.HtmlReporter = function(_doc) {
		...
		doc.body.appendChild(dom.reporter);
		...
	}

So, it seems that I can pass something to the constructor of HtmlReporter, but it should have a property body which is actually a DOM element. I.e. I have to pass a document object. What I did is editing of *jasmine-html.js* on two places:

	// jasmine.HtmlReporter = function(_doc) {
	jasmine.HtmlReporter = function(_doc, renderIn) {

And 

	// doc.body.appendChild(dom.reporter);
	(renderIn || doc.body).appendChild(dom.reporter);

So, now I'm able to do the following:

	var htmlReporter = new jasmine.HtmlReporter(null, document.getElementById(id));

And the results are send to the right place. I.e. my own custom div holder.

## Clearing HtmlReporters

Jasmine offers adding multiple reporters, which is kinda cool. The problem is that there is no method for removing them. Here is my scenario: 

  - I have a function which initialize the test suite.
  - The function could be called several times and every time should start a new suite.
  - I'm using the above solution and I'm rendering the output in a custom divs
  - However *var jasmineEnv = jasmine.getEnv();* actually returns same object which has already added reporters
  - From time to time I'm removing the div holders, but there are HtmlReporters attached to them
  - At the end there is an error throwing, because the divs are missing

I needed a change in *jasmine.js* and to be more specific in *jasmine.Env.prototype*. So, I added:

	jasmine.Env.prototype.clearReporters = function(reporter) {
		this.reporter.clear();
	};

And of course the *clear* method of the reporter which is actually an instance of *jasmine.MultiReporter*:

	jasmine.MultiReporter.prototype.clear = function(reporter) {
		this.subReporters_ = [];
	};

I called the method simply with:

	var htmlReporter = new jasmine.HtmlReporter(null, document.getElementById(id));
	jasmineEnv.clearReporters();

## The support of asynchronous operations

That's actually the most important change for me. Based on the documentation you are able to test asynchronous operations like that:

	it("should support async execution of test preparation and exepectations", function() {
		runs(function() {
		    flag = false;
		    value = 0;
		    setTimeout(function() {
		        flag = true;
		    }, 500);
		});
		waitsFor(function() {
		    value++;
		    return flag;
		}, "The Value should be incremented", 750);
		runs(function() {
		    expect(value).toBeGreaterThan(0);
		});
	})

Too complex, don't you think. In the NodeJS version of the framework the things are much much better:

	var request = require('request');
	it("should respond with hello world", function(done) {
		request("http://localhost:3000/hello", function(error, response, body){
			expect(body).toEqual("hello world");
			done();
		});
    });

I.e. you are receiving a function *done*, which you can call indicating that the test is finished. I wanted such functionality in the client side too. I managed to do this with a little change in *jasmine.js*. Find the following piece of code:

	jasmine.Block.prototype.execute = function(onComplete) {
		if (!jasmine.CATCH_EXCEPTIONS) {
			this.func.apply(this.spec);
		}
		else {
			try {
				this.func.apply(this.spec);
			} catch (e) {
				this.spec.fail(e);
			}
		}
		onComplete();
	};

And change it to:

	jasmine.Block.prototype.execute = function(onComplete) {
		if (!jasmine.CATCH_EXCEPTIONS) {
			this.func.apply(this.spec, [function() {
				onComplete();
			}]);
		}
		else {
			try {
				this.func.apply(this.spec, [function() {
					onComplete();
				}]);
			} catch (e) {
				this.spec.fail(e);
			}
		}
	};

I.e. I found that *onComplete* function actually calls the next test. Instead of executing this method directly I'm wrapping it into a function, which acts as *done*. 

And now, I'm able to run:

	it("should get the current date", function(done) {
		getCurrentDate(function(res) {
			expect(res.monthName).toBeDefined();
			done();
		});
	});

<br /><br />
P.S.
My changes are based on *jasmine-1.3.1* version.