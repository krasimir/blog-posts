# Look ma, JavaScript only Off-Canvas menu

The off-canvas menu is pretty popular nowadays. You know, the little button in the right upper corner which opens the navigation with a slide-in effect. That's what we are going to build in this article. The interesting things is that we are not going to use CSS neither HTML, only JavaScript.

([Here is a demo](http://krasimirtsonev.com/blog/articles/LookMaJavaScriptOnlyOffCanvas/index.html) of the final result.)

## The challenge

Before to start let's define the rules.

* We should be able to open and close the menu
* The content should shrink giving space for the menu
* The links in the menu should be passed to the menu's constructor
* No CSS styles
* No HTML markup
* JavaScript only
* Should support left and right positioning
* Less then 100 lines of code

## The tools

We are going to use [AbsurdJS](http://absurdjs.com/) and its [client-side components](http://absurdjs.com/pages/client-side-components/). The documentation of the library is available [here](http://absurdjs.com/pages/documentation/), but I'll give you a quick brief on its features. It's initially developed as Node.js CSS preprocessor. Later it starts supporting HTML preprocessing and it was ported for browser usage. Today it has bunch of build-in modules like [Router](http://absurdjs.com/pages/api/build-in-components/#router), [Ajax wrapper](http://absurdjs.com/pages/api/build-in-components/#ajax), [MediaQuery](http://absurdjs.com/pages/api/build-in-components/#mq) helper and so on. It could add CSS and HTML to your pages dynamically. 

We are going to use [Organic](http://absurdjs.com/pages/css-preprocessing/organic-css/). It's something like a plugin for AbsurdJS which adds a lot of ready-to-use snippets. So, our page needs three files:

	<script src="absurd.organic.min.js"></script>
	<script src="absurd.min.js"></script>
	<script src="absurd.off-canvas.js"></script>

<i>absurd.off-canvas.js</i> is the file which will contain the code of the menu.

## The HTML

The only markup which will be available is the one which defines the content of the page.

	<body>
		<div class="content">
			...		
		</div>
	</body>

## Defining the component

	var absurd = Absurd();
	var Menu = absurd.component('OffCanvas', {
		links: [],
		content: null,
		position: null,
		isOpen: false,
		constructor: function(links, content, position) {
			this.links = links;
			this.content = content;
			this.position = position;
		}
	});

The first line initializes AbsurdJS library. The second one defines the class of our component. There are few custom variables set. <i>links</i> will contain the buttons of the menu, <i>content</i> will be a string representing the content's container selector. <i>position</i> and <i>isOpen</i> are flags. The entry point of the menu is the <i>constructor</i> function. It's called automatically when the component is created.

	Menu([
		{ label: 'The library', url: 'http://absurdjs.com/'},
		{ label: 'Documentation', url: 'http://absurdjs.com/pages/documentation/'},
		{ label: 'Download', url: 'http://absurdjs.com/pages/builds/'},
		{ label: 'Contribute', url: 'http://absurdjs.com/#contribute'},
		{ label: 'Testing', url: 'http://absurdjs.com/#testing'}
	], '.content', 'right');

## Bootstrapping 

As we saw above every component has its own <i>constructor</i> function. However, we don't want to do anything before to get the page fully loaded. AbsurdJS listens for the <i>load</i> event and fires a <i>ready</i> method (if that method is defined).

	var Menu = absurd.component('OffCanvas', {
		links: [],
		content: null,
		position: null,
		isOpen: false,
		ready: function() {
			// page is loaded
		},
		constructor: function(links, content, position) {
			this.links = links;
			this.content = content;
			this.position = position;
		}
	});

In our case we need to append a new element to the <i>body</i> of the page. A element which will contain the links and open-close button. AbsurdJS has build-in helper for DOM manipulations and we will use it.

	ready: function(dom) {
		this
		.set('parent', dom('body').el)
		.populate();
	}

The library has dependency injection container implemented. In other words if you need something you may just add it as a parameter in your function. There are some build-in modules ready to be injected. Like for example the <i>dom</i> helper. <i>dom('body').el</i> selects the <i>body</i> tag and by setting it as a parent we are saying that our menu will be attached as a child to that element. The <i>populate</i> method is the only one thing which may look like a magic. It does several things like CSS and HTML compilation, event binding, dependencies management etc.

If we run the code as it is now we will see only the content. That's because we didn't define the HTML code of the menu.

## Constructing the HTML

Let's do that in a new function called <i>buildIt</i>. We will call it before the population.

	ready: function(dom) {
		this
		.set('parent', dom('body').el)
		.buildIt().populate();
	}

AbsurdJS can generate HTML from a JavaScript object. Internally it has mechanisms for transforming that HTML to a valid DOM element. It also acts as a [template engine](http://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line). I.e. we may add data to the generated markup. Here is how our functions looks like:

	buildIt: function() {
		this.html = {
			'.menu': {
				'a.toggle[href="#" data-absurd-event="click:toggle"]': this.isOpen ? 'Close' : 'Menu',
				'.menu-content': {
					p: 'Wow ... it works!',
					'.links': [
						'<% for(var i=0, link; i<links.length, link=links[i]; i++) { %>',
						{ 'a[href="#"]': '<% link.label %>' },
						'<% } %>'
					]
				}
			}
		}
		return this;
	}

The definition should be set to the <i>html</i> property. Otherwise the library will not find it. After the compilation the element which we will get is:

	<div class="menu">
		<a class="toggle" href="#" data-absurd-event="click:toggle">Menu</a>
		<div class="menu-content">
			<p>Wow ... it works!</p>
			<div class="links">
				<a href="#">The library</a>
				<a href="#">Documentation</a>
				<a href="#">Download</a>
				<a href="#">Contribute</a>
				<a href="#">Testing</a>
			</div>
		</div>
	</div>

I.e. <i>.menu</i> is transformed to <i>&lt;div class="menu">&lt;/div></i>. The needed attributes are applied in square brackets. The template engine expressions are put between <i>&lt;%</i> and <i>%></i> markers. In fact the code between this signs is valid JavaScript executed in the context of the current component. That's why we have an access to the <i>links</i> variable which is actually a property of the component.

The listening for DOM event happens by setting a value of <i>data-absurd-event</i> attribute. There is the type of the event and its handler, which is a function of the component. For example, according to the code above we have to define:

	toggle: function(e, dom) {
		e.preventDefault();
		this.isOpen = !this.isOpen;
		this.buildIt().populate();
	}

That method is called when the open-close button is clicked. It changes the value of the <i>isOpen</i> flag, rebuilds the markup and fires the compilation again. And because the <i>html</i> property is changed the label of the button is updated from <i>Open</i> to <i>Close</i> and vise versa.

## Showing/Hiding the menu

As it is now the menu is positioned at the bottom of the page. It's like that because it is added as a new element of the <i>body</i> tag. In most of the cases such off-canvas menus are implemented by defining two CSS classes. The first on positions the menu outside the page and the second one moves it into the canvas. However, this means that we need to add and remove those classes all the time. With AbsurdJS this is not necessary because we may compile CSS dynamically. All we have to do is to change the CSS definitions and call the <i>populate</i> method. Let's create a new function called <i>styleIt</i> which will create the styles. We have to call this function along with <i>buildIt</i>.

	styleIt: function() {
		this.css = {
			'.menu': {
				pos: 'f', 
				top: 0, 
				left: '100%', 
				hei: '100%',
				mar: '0 0 0 -80px'
			}
		}
		return this;
	}

It may looks a little bit strange in the beginning. Some of the CSS properties are somehow truncated. That's because we added [Organic](http://absurdjs.com/pages/css-preprocessing/organic-css/).

* pos:f - position: fixed
* hei: 100% - height: 100%
* mar: 0 0 0 -80px - margin: 0 0 0 -80px

This little extension of AbsurdJS brings tons of helpful atoms and molecules (think about them as mixins). The full list is available [here](http://absurdjs.com/pages/css-preprocessing/organic-css/atoms/). We are going to use them a lot so you will learn some of the them.

What we did with the above object is that we positioned the menu in the top right corner, hide it and showed only 80px on its left side. These 80px are reserved for the open-close button. We are going to support the menu on the left side of the page so the following changes need to be made:

	styleIt: function() {
		var x = this.position == 'right' ? (this.isOpen ? -380 : -80) : (this.isOpen ? 300 : 0);
		var leftMenu = this.position == 'right' ? '100%' : '10px';
		this.css = {
			'.menu': {
				pos: 'f', 
				top: 0, 
				left: leftMenu, 
				hei: '100%',
				mar: '0 0 0 ' + x + 'px'
			}
		}
		return this;
	}

I.e. we are using the flags <i>position</i> and <i>isOpen</i> to found out the values of the <i>left</i> and <i>margin</i> properties. We want our menu animated so we could use transitions.

	'.menu': {
		...
		'-wmo-trs': 'all 400ms'
	}

This is equal to:

	transition: all 400ms;
	-webkit-transition: all 400ms;
	-moz-transition: all 400ms;
	-o-transition: all 400ms;

<i>-wmo-</i> is for adding the prefixes' versions of the <i>transition</i> property.

Now let's add some styling of the open-close button and the links' container.

	'.toggle': {
		ted: 'n', 
		d: 'b', 
		ta: 'c', 
		mar: '20px 0 0 0',
		color: this.isOpen ? '#BDBDBD': '#6E6E6E',
		wid: '60px',
		'-wmo-trs': 'all 400ms',
		bdb: 'dotted 1px #FFF',
		'&:hover': { color: '#000', bdb: 'dotted 1px #333' }
	},
	'.menu-content': {
		pos: 'a', 
		top: 0, 
		left: leftMenuContent, 
		wid: '300px', 
		bg: '#565656', 
		hei: '100%',
		p: { pad: '20px', mar: 0, color: '#FFF', fz: '30px' },
		a: {
			d: 'b', color: '#FFF', ted: 'n', '-wm-bxz': 'bb',
			wid: '100%', pad: '6px 20px',
			bdt: 'dotted 1px #999', bdb: 'dotted 1px #333',
			'-wmo-trs': 'all 200ms',
			'&:hover': { pad: '6px 20px 6px 30px', bg: '#848484' }
		}
	}

Again, bunch of shortcuts are used. 

* d:b - display:block
* ta:c - text-align:center
* ted:n - text-decoration:none
* bdb - border-bottom
* fz - font-size
* bxz:bb - box-sizing: border-box

Also notice the usage of the ampersand. It has the same meaning as in LESS or SASS. It represents the current selector.

With the latest additions the menu looks almost finished. The following lines of code will make the container of the page's content shrinking.

	this.css[this.content] = { '-wmo-trs': 'all 400ms' };
	if(this.isOpen) {
		this.css[this.content][this.position == 'left' ? 'pl' : 'pr'] = '320px';
	}

We will animate it and the first line applies a value to the transition property. When the menu is opened we are changing the <i>padding-left</i> or <i>padding-right</i> properties.

To make the things a little bit more interesting we will add the following code:

	if(this.isOpen) {
		this.css['.menu']['.toggle'].animate = 'bounceInDown';
	}

It applies an animation on the open-close button if the menu is opened. <i>bounceInDown</i> comes from [Animate.css](http://daneden.github.io/animate.css/). That's a wonderful CSS library developed by [Daniel Eden](http://daneden.me/). Organic adopts it and provides a molecule (mixin) which applies the animations to the given element. [Here is](http://absurdjs.com/pages/css-preprocessing/organic-css/molecules/#animate-small-class-prop-values-string-object-array-small-) more information about this property.

## Summary

I lied. We used CSS and we used HTML. However, they don't exist in the beginning and they are generated dynamically. AbsurdJS provides mechanisms for binding data to CSS styles and HTML markup which makes the front-end development really interesting. I'm personally using the library in a quite big project and I could say that the concept works nicely.

The working demo of the menu could be seen [here](http://krasimirtsonev.com/blog/articles/LookMaJavaScriptOnlyOffCanvas/index.html). It's source code is also [available at GitHub](https://github.com/krasimir/blog-posts/tree/master/LookMaJavaScriptOnlyOffCanvas/code). 