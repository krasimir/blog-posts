# CSS: Understanding first-child, second-child and nth-child 

I like the [CSS](http://krasimirtsonev.com/blog/category/CSS3) only solutions. Very often I need to select a specific DOM element. Sure I could add a new class, but it is always nice if I can do that inside my stylesheets. It's just looks better and keeps my HTML markup clean. *first-child*, *last-child* and *nth-child* are made exactly for this purpose.

Here is the markup which I'm going to use in this article:

	<div class="wrapper">
	    <div class="content">
	        <p>Row1</p>
	        <a href="#">text in between</a>
	        <p>Row2</p>
	        <p>Row3</p>
	        <p>Row4</p>
	        <p>Row4</p>
	    </div>
	    <div class="content">
	        <p>RowA</p>
	        <p>RowB</p>
	        <p>RowC</p>
	        <p>RowD</p>
	        <p>RowE</p>
	        <a href="#">link at the end</a>
	    </div>
	</div>

## first-child

The *first-child* pseudo selector matches the first element of series of tags. That's only valid for a specific scope. And by scope I mean DOM element. In the markup above every *.content* div defines its own scope. So, if you write:

	p:first-child {
	    font-weight: bold;
	    text-decoration: underline;
	}

those styles will be applied to *Row1* and *RowA*, because they are first matches of *p* tag inside their parents.

## last-child

It works absolutely identical as *first-child*, but it selects the last element in the list. However, if we use the same markup and add

	p:last-child {
	    color: #000;
	}

only *Row4* will be changed. Why is that? It's because in the second *.content* div *RowE* is not the very last child. It's actually a link represented by *a* tag. So, *p:last-child* became invalid. 

## nth-child

What if you want to select only the third paragraph. *nth-child* accepts a number, a keyword, or a formula. For example:

	p:nth-child(3) {
	    color: #00009F;
	}

matches *Row2* (because it's a third element in its scope) and *RowC*. You are able to pass *odd*, *even* or *3n+0* for example, which styles every element whose index is a multiple of 3.

## nth-of-type

As you already saw, the above classes could lead to a unexpected results. That's because not always your selectors are valid and apply styles to the element which you want. In those cases you may use *nth-of-type*.

	p:nth-of-type(4) {
	    color: #009F00;
	}

This selects *Row4* and *RowD*. I.e. every fourth paragraph.