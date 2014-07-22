Nowadays the popular single page applications are everywhere. Having such application means that you need a solid routing mechanism. Frameworks like [Emberjs](http://emberjs.com/) are truly build on top of a Router class. I'm still not sure that this is a concept which I like, but I'm absolutely sure that [AbsurdJS](http://absurdjs.com/) should have a build-in Router. And, as with everything in this little library, it should be small, simple class. Let's see how such a module may look like.

## Requirements

The router should ...

* be less then 100 lines
* supports hash typed URLs like <i>http://site.com#products/list</i>
* work with the [History API](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history)
* provide easy-to-use API
* not run automatically 
* listen for changes only if we want to

## The Singleton

I decided to have only one instance of the router. This may be a bad choice, because I had project where I need several routers, but this was unusual application. If we implement the [Singleton](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#singletonpatternjavascript) pattern we will not need to pass the router from object to object and we don't have to worry about creating it. We want only one instance, so we may create it automatically.

	var Router = {
		routes: [],
		mode: null,
		root: '/'
	}

There are three properties which we need.

<ul>
	<li>routes - it keeps the current registered routes</li>
	<li>mode - could be 'hash' or 'history' showing if we use the History API or not</li>
	<li>root - the root URL path of the application. It is needed only if we use <i>pushState</i>.</li>
</ul>

## Configuration

We need a method which will set up the router. We have only two things to pass, but it is good to do this within a function.

	var Router = {
		routes: [],
		mode: null,
		root: '/',
		config: function(options) {
			this.mode = options && options.mode && options.mode == 'history' 
						&& !!(history.pushState) ? 'history' : 'hash';
			this.root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
			return this;
		}
	}

The mode is equal to 'history' only if we want to and of course only if the <i>pushState</i> is supported. Otherwise we are going to work with the hash in the URL. The <i>root</i> by default is set to a single slash '/'.

## Getting the current URL

This is an important part of our router, because it will tell us where we are at the moment. We have two modes so we need a <i>if</i> statement.

	getFragment: function() {
		var fragment = '';
		if(this.mode === 'history') {
			fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
			fragment = fragment.replace(/\?(.*)$/, '');
			fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
		} else {
			var match = window.location.href.match(/#(.*)$/);
			fragment = match ? match[1] : '';
		}
		return this.clearSlashes(fragment);
	} 

In both cases we are using the global <i>window.location</i> object. In the 'history' mode version we need to remove the <i>root</i> part of the URL. We should also delete all the GET parameters and this is done with a regex (/\?(.*)$/). The getting of the hash value is a little bit more easier. Notice the usage of the <i>clearSlashes</i> function. It's job is to remove the slashes from the beginning and from the end of the string. This is necessary, because we don't want to force the developer to use a specific format of the URLs. Whatever he passes it is translated to a same value.

	clearSlashes: function(path) {
    	return path.toString().replace(/\/$/, '').replace(/^\//, '');
    }

## Adding and removing routes

While I'm working on [AbsurdJS](http://absurdjs.com/) I'm always trying to give as much control as possible to the developers. In almost every router implementation the routes are defined as strings. However I prefer to pass directly a regular expression. It's much more flexible, because we may do really crazy matches.

	add: function(re, handler) {
		if(typeof re == 'function') {
			handler = re;
			re = '';
		}
		this.routes.push({ re: re, handler: handler});
		return this;
	}

The function fills the <i>routes</i> array. If only a function is passed then it is considered as a handler of the default route which is just an empty string. Notice that most of the functions return <i>this</i>. This will help us to chain the methods of the class.

	remove: function(param) {
		for(var i=0, r; i<this.routes.length, r = this.routes[i]; i++) {
			if(r.handler === param || r.re === param) {
				this.routes.splice(i, 1); 
				return this;
			}
		}
		return this;
	}

The deletion of a route could happen only if we pass a matching regular expression or the handler passed to <i>add</i> method.

	flush: function() {
		this.routes = [];
		this.mode = null;
		this.root = '/';
		return this;
	}

Sometimes we may need to reinitialize the class. So the <i>flush</i> method above could be used in such cases.

## Check-in

Ok, we have an API for adding and removing URLs. We are also able to get the current address. So, the next logical step is to compare the registered entries.

	check: function(f) {
		var fragment = f || this.getFragment();
		for(var i=0; i<this.routes.length; i++) {
			var match = fragment.match(this.routes[i].re);
			if(match) {
				match.shift();
				this.routes[i].handler.apply({}, match);
				return this;
			}			
		}
		return this;
	}

We are getting the fragment by using the `getFragment` method or accepting it as a parameter to the function. After that we perform a normal loop through the routes and try to find a match. There is a variable <i>match</i> which value is <i>null</i> if the regular expression doesn't match. Otherwise its value is something like

	["products/12/edit/22", "12", "22", index: 1, input: "/products/12/edit/22"]

It's array-like object, which contains the matched string and all remembered substrings. This means that if we <i>shift</i> the first element we will get an array of the dynamic parts. For example:

	Router
	.add(/about/, function() {
		console.log('about');
	})
	.add(/products\/(.*)\/edit\/(.*)/, function() {
		console.log('products', arguments);
	})
	.add(function() {
		console.log('default');
	})
	.check('/products/12/edit/22');

This script outputs:

	products ["12", "22"]

That's how we could handle dynamic URLs.

## Monitoring for changes

Of course we can't run the <i>check</i> method all the time. We need a logic which will notify us for changes in the address bar. And by changes I mean even hitting the <i>back</i> button of the browser. Those of you which play with the History API know that there is a <i>popstate</i> event. It is triggered when the URL is changed. However I found that some browser dispatch this event on page load. This with some other differences makes me think for another solution. And because I wanted to have monitoring even if the mode is set to <i>hash</i> I decided to use <i>setInterval</i>

	listen: function() {
		var self = this;
		var current = self.getFragment();
		var fn = function() {
			if(current !== self.getFragment()) {
				current = self.getFragment();
				self.check(current);
			}
		}
		clearInterval(this.interval);
		this.interval = setInterval(fn, 50);
		return this;
	}

We need to keep the latest URL so we are able to compare it to the new one.

## Changing the URL

At the end our router needs a function which changes the current address and of course fires the route's handler.

	navigate: function(path) {
		path = path ? path : '';
		if(this.mode === 'history') {
			history.pushState(null, null, this.root + this.clearSlashes(path));
		} else {
			window.location.href.match(/#(.*)$/);
			window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
		}
		return this;
	}

Again, we are doing different things depending on the <i>mode</i> property. If the History API is available we are using <i>pushState</i>. Otherwise the good old <i>window.location</i> is on the line.

## Final source code

And here is the finished version of the router with a little example:

	var Router = {
		routes: [],
		mode: null,
		root: '/',
		config: function(options) {
			this.mode = options && options.mode && options.mode == 'history' 
						&& !!(history.pushState) ? 'history' : 'hash';
			this.root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
			return this;
		},
		getFragment: function() {
			var fragment = '';
			if(this.mode === 'history') {
				fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
				fragment = fragment.replace(/\?(.*)$/, '');
				fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
			} else {
				var match = window.location.href.match(/#(.*)$/);
				fragment = match ? match[1] : '';
			}
			return this.clearSlashes(fragment);
		},
		clearSlashes: function(path) {
	    	return path.toString().replace(/\/$/, '').replace(/^\//, '');
	    },
		add: function(re, handler) {
			if(typeof re == 'function') {
				handler = re;
				re = '';
			}
			this.routes.push({ re: re, handler: handler});
			return this;
		},
		remove: function(param) {
			for(var i=0, r; i<this.routes.length, r = this.routes[i]; i++) {
				if(r.handler === param || r.re === param) {
					this.routes.splice(i, 1); 
					return this;
				}
			}
			return this;
		},
		flush: function() {
			this.routes = [];
			this.mode = null;
			this.root = '/';
			return this;
		},
		check: function(f) {
			var fragment = f || this.getFragment();
			for(var i=0; i<this.routes.length; i++) {
				var match = fragment.match(this.routes[i].re);
				if(match) {
					match.shift();
					this.routes[i].handler.apply({}, match);
					return this;
				}			
			}
			return this;
		},
		listen: function() {
			var self = this;
			var current = self.getFragment();
			var fn = function() {
				if(current !== self.getFragment()) {
					current = self.getFragment();
					self.check(current);
				}
			}
			clearInterval(this.interval);
			this.interval = setInterval(fn, 50);
			return this;
		},
		navigate: function(path) {
			path = path ? path : '';
			if(this.mode === 'history') {
				history.pushState(null, null, this.root + this.clearSlashes(path));
			} else {
				window.location.href.match(/#(.*)$/);
				window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
			}
			return this;
		}
	}

	// configuration
	Router.config({ mode: 'history'});

	// returning the user to the initial state
	Router.navigate();

	// adding routes
	Router
	.add(/about/, function() {
		console.log('about');
	})
	.add(/products\/(.*)\/edit\/(.*)/, function() {
		console.log('products', arguments);
	})
	.add(function() {
		console.log('default');
	})
	.check('/products/12/edit/22').listen();

	// forwarding
	Router.navigate('/about');

## Summary

The router is around 90 lines. It supports hash typed URLs and the new History API. It could be really helpful if you don't want to use a whole framework only because of the routing capabilities. 

This class is part of [AbsurdJS](http://absurdjs.com/) library. Checkout the documentation page of the class [here](http://absurdjs.com/pages/api/build-in-components/#router).