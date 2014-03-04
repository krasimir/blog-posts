If you believe in responsive design you probably use a lot of [media queries](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Media_queries). That's a CSS feature which gives us the power to add something like <i>if</i> statements. We are able to apply rules only if the current page meets certain conditions. In this article I'll show you how I use media queries in JavaScript.

We all know how it works. We type the media query and every rule define in it is applied to the page only if the conditions are valid.

	@media all and (max-width: 700px) {
        body {
        	background: #FF0;
        }
    }

This is pretty cool and it acts as a base of the responsive design. The designers need to change the look of the site in specific dimensions. The same is true for the developers. We all want to make our applications adaptive. We want to write the code once and support various devices. We are living in great times and this is now possible. There is a <i>window.matchMedia</i> function. It is well supported and if you don't need to support IE8 or lower you may use it without worries.

	var mq = window.matchMedia('@media all and (max-width: 700px)');
	if(mq.matches) {
		// the width of browser is more then 700px
	} else {
		// the width of browser is less then 700px
	}

And not only that, we may add an event listener and wait for changes. 

	mq.addListener(function(changed) {
		if(changed.matches) {
			// the width of browser is more then 700px
		} else {
			// the width of browser is less then 700px
		}
	});

During the last few weeks I'm developing the [client-side components of AbsurdJS](http://absurdjs.com/pages/client-side-components/). I'm filling the library with small but useful [build-in modules](http://absurdjs.com/pages/api/build-in-components/). The usage of media queries in JavaScript part of the application brings a lot of benefits and I wanted to have this ready-to-use. Yes, we could get the current width or height of the screen with plain JavaScript. It is maybe a little bit tricky because the different browsers provide different properties but it is still possible. However, media queries are more then comparison of dimensions.

	@media all and (orientation: portrait) { ... }
	@media screen and (min-resolution: 2dppx) { ... }
	@media tv and (scan: progressive) { ... }

As you can see we are able to write styles for a device with specific characteristics. It's really simple and doesn't require tons of code. Media query itself is supported in almost every browser. Of course InternetExplorer has its own opinion and this CSS feature works in version 9 and up. Anyway, if we talk about CSS we could use them. But what happen if <i>window.matchMedia</i> is not supported.

	var mq = function(query, callback, usePolyfill) {
		var host = {};
		var isMatchMediaSupported = !!(window && window.matchMedia) && !usePolyfill;
		if(isMatchMediaSupported) {
			var res = window.matchMedia(query);
			callback.apply(host, [res.matches, res.media]);
			res.addListener(function(changed) {
				callback.apply(host, [changed.matches, changed.media]);
			});
		} else {
			// ... polyfill
		}
	}

That's what I started with. The <i>usePolyfill</i> variable is needed because I wanted to test the polyfill in browsers which support <i>window.matchMedia</i>. The other part of the code is trivial. Calling the sent callback within specific context and passing the result as parameters. Here is how this function could be used:

	mq('all and (min-width: 300px)', function(match) {
        // match = true or false
    });

And now it gets interesting. What the polyfill should do. In general we are mostly interested in the changes of the screen's width and height. Most of the solutions which I found are based on the <i>resize</i> event dispatched by the <i>window</i> object. They listen for that event, get the new dimensions and check if the passed query works. This is of course not enough, because sometimes we need to know that our app is running on a tv or it has lower dpi. And because I'm writing this function for AbsurdJS I decided to use the features of the library for solving the problem. The idea is simple. I'll add a <i>span</i> element to the <i>body</i> tag. I'll monitor its <i>display</i> property. And of course that property will be controlled by the media query used by the developer. You need to know a little bit more about [AbsurdJS's client-side components](http://absurdjs.com/pages/client-side-components/) to fully understand the code below, but shortly they are JavaScript classes which could compile CSS and HTML at runtime. 

Before to start with the implementation of the component let's first define its CSS and HTML.

	ar id = ".match-media-" + absurd.components.numOfComponents;
	var css = {}, html = {};
	css[id] = { display: 'block' };
	css[id]['@media ' + query] = { display: 'none' };
	html['span' + id] = '';

We need an unique <i>id</i> because we may have more then one usage of the <i>mq</i> function on the page. The rest is just the usual JavaScript object definition. <i>absurd.components.numOfComponents</i> is a number which is incremented during the components' definition.

	absurd.component(id + '-component', {
		css: css,
		html: html,
		intervaliTime: 30,
		status: '',
		loop: function(dom) {
			var self = this;
			if(this.el) {
				var d = this.getStyle('display');
				if(this.status != d) {
					this.status = d;
					callback.apply(host, [d === 'none'])
				}
			}
			setTimeout(function() { self.loop(); }, this.intervaliTime);
		},
		constructor: ['dom', function(dom) {
			var self = this;
			this.set('parent', dom('body').el).populate();
			setTimeout(function() { self.loop(); }, this.intervaliTime);
		}]
	})();

This is how the finished component looks like. The <i>constructor</i> method is called immediately. It has the <i>dom</i> module injected. We need it to get a reference to the <i>body</i> tag. You may read more about it [here](http://absurdjs.com/pages/api/build-in-components/#dom). The same effect could be achieved by using <i>document.querySelector</i>. We set the parent DOM element of the component and call the <i>populate</i> method. That's the place where AbsurdJS compiles the <i>css</i> and <i>html</i> properties. What is important here is that the library appends the generated CSS as a <i>style</i> tag in the head of the current document and the generated DOM element and to the parent. At the end of the constructor we are calling the <i>loop</i> method which will be fired again and again in order to catch the changes in the span's <i>display</i> property. There is a <i>status</i> variable which stores the latest value. 

Thankfully to AbsurdJS the polyfill of <i>window.matchMedia</i> is just 22 lines of code. And it still works with complex media queries, because it actually uses CSS.

If you want to see this in action check the JSBin below. Just move the panels' divider to the right.

<a class="jsbin-embed" href="http://jsbin.com/paqegexe/26/embed?js,output">JS Bin</a><script src="http://static.jsbin.com/js/embed.js"></script>

Notice that the example uses the polyfill directly (i.e. there is a <i>true</i> parameter at the end of the <i>mq</i> call). If you inspect the right part of the JSBin iframe will notice that the following CSS is added to the <i>head</i>:

	<style id=".match-media-1-component-css" type="text/css">
		.match-media-1 {
		  display: block;
		}
		@media all and (min-width: 300px) {
		  .match-media-1 {
		    display: none;
		  }
		}
	</style>

And the following span tag is attached to the <i>body</i>.

	<span class="match-media-1"></span>

P.S.
The code written in this article is tested under Chrome, Firefox, Safari, Opera and IE9. If the example works properly or doesn't work inside your browser please comment below. There are also Jasmine tests of the media query module in AbsurdJS. They are available [here](http://absurdjs.com/tests/?spec=Testing%20components%20(media%20queries)) and wait for you.