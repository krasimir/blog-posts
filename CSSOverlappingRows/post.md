# CSS: The background color and overlapping rows

The goal is to achieve this:

![Alt text](http://krasimirtsonev.com/blog/articles/CSSOverlappingRows/goal.jpg)

I started with a simple html like:

	<h1>
		Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempor tincidunt erat, et facilisis metus feugiat at. 
	</h1>

And the following CSS:

	h1 {
	    text-transform: uppercase;
	    font-family: Arial;
	    line-height: 30px;
	    font-size: 30px;
	    padding: 10px;
	    background: #7f7f7f;
	    color: #FFF;
	}

Because the *h1* tag by default is a block element the background takes the whole area 

![Alt text](http://krasimirtsonev.com/blog/articles/CSSOverlappingRows/try1.jpg)

So, I made my title *inline* element with *display: inline* and the result is:

![Alt text](http://krasimirtsonev.com/blog/articles/CSSOverlappingRows/try2.jpg)

The solution was to wrap the text inside the title in a *span* element.

	<h1>
	    <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempor tincidunt erat, et facilisis metus feugiat at.</span> 
	</h1>

And add one more style about the new element:

	h1 span {
	    position: relative;
	}

Here is the final result:

<iframe width="100%" height="300" src="http://jsfiddle.net/krasimir/mWgez/3/embedded/result,html,css/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>