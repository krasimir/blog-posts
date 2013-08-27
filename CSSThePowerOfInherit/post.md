# CSS: the power of inherit 

Luckily, I have time to watch screencasts from various conferences. Last few weeks I'm watching videos from [Fronteers2012](https://vimeo.com/channels/fronteers12). They are all great and it worths checking out. However, there is something which I found really interesting. It's about animating pseudo elements.

## The problem

As you may know only Firefox supports chaining of pseudo classes and elements. For example this doesn't work everywhere.

	.box:hover:before {
		font-size: 20px;
	}

Why you ever need this? If it was supported by all the browser, the developers may use this for animating [pseudo elements](http://krasimirtsonev.com/blog/article/CSS-before-and-after-pseudo-elements-in-practice). They are very often used for bullets or icons in front of elements in a list and it will be nice to add transitions there.

## The solution

There is a of course a workaround. It involves the usage of *inherit* value. If you use it, you are basically saying *"get the value from my parent element"*. For example:

	<div class="wrapper">
		<p>Text</p>
	</div>

	.wrapper {
		color: #0F0;
	}
	.p {
		color: inherit;
	}

The color of the text in the paragraph is the same as the one set of the wrapper. That's because we use *inherit* as a value. 

Let's get a real use case. We have a div called *.box* and text inside it.

	<div class="box">
	    I'm a box
	</div>

With pure CSS we are making an icon in front of the text.

	.box:before {
	    display: block;
	    float: left;
	    width: 15px;
	    height: 15px;
	    content: "";
	    margin: 3px 12px 0 0;
	    background-image: url('...');
	}

This looks great, but we want to animate the bullet. The image used as a background looks like that:

![CSS: the power of inherit](http://krasimirtsonev.com/blog/articles/CSSThePowerOfInherit/icon-bullet.jpg)

I.e. to animate it we just need to change the *background-position* property and move the background a bit. However, because we can't use *.box:hover:before* we need to use another approach. On mouse over we could change values on the *.box* class. The pseudo element is actually a child of it, so if we use *inherit* we will have an access to the value which we need. Here is what I'm talking about:

	.box {
		background-position: 0 0;
	}
	.box:before {
		background-position: inherit;
	}
	.box:hover {
		background-position: 15px 0;
	}

The *background-position* property by default is set to *0px 0px*. If we hover the box it will become *15px 0px*. And because the pseudo element inherits this value it will have the same *15px 0px* applied. The box itself doesn't have background, which means that changing *backgroud-position* doesn't affect anything. Here is the solution in practice:

<iframe width="100%" height="250" src="http://jsfiddle.net/krasimir/jV4nf/5/embedded/result,html,css" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

So, the idea is to find something which is not working for the container, but it is important for the pseudo element. For example, you may use *top* and *left* to move the icon. You know that these properties take affect only if you position the element absolutely or it is a fixed one. 

	.box {
		
	}
	.box:before {
		position: absolute;
		top: inherit;
		left: inherit;
	}
	.box:hover {
		top: 20px;
		left: 12px;
	}

*top* and *left* doesn't move the box, but they move the bullet.

## Credits

The credits of this smart approach goes to [Roman Komarov](https://twitter.com/kizmarh). His talk is available at [Vimeo](https://vimeo.com/channels/fronteers12/51897358).

<iframe src="//player.vimeo.com/video/51897358" width="100%" height="300" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>