# Few CSS challenges

We all have problems working with HTML and CSS. To save time many developers use JavaScript to solve them. However, I prefer to avoid such solutions and provide CSS only workarounds. That's the idea of this article. I wanted to share two challenges which I faced with. 

## Challenge #1 - centering an image

I'm working on a gallery type site and I need to show photos. Of course the size of the images is unknown.

The following sketch illustrates the situation:

![CSS Challenge](http://krasimirtsonev.com/blog/articles/CSSChallenge1/img/challenge.jpg)

I.e. I have a div, wrapper which contains an image tag. The picture should expand and fill the parent element. Together with that it should be centered vertically/horizontally. The size of the image and the container could vary.

	<div class="wrapper">
		<img src="pic.jpg" />
	</div>

Let's say that the wrapper has the following CSS applied:

	.wrapper {
        width: 400px;
        height: 200px;
        overflow: hidden;
    }

As I said, the dimensions of the container could vary. The solution should work even with 400x200. And remember, I can't use JavaScript to get the size of the image, make calculations or change CSS properties.

### What I tried and it didn't work

The very first thing, which I did was to apply *max-width: 100%* to the image tag. The photo was successfully resized to exactly 400px by width. The problem was that it wasn't centered and, more importantly if the image was small and its width was less then 400px there was some unfilled space. So, I replaced *max-width* with simply *width*. This guaranteed that the image will be resized to exactly 400px no matter what. The first step was made and I thought that I was in the right direction.

The next thing, which I had to fight with was the centering. I tried several variants with negative margin or padding. The absolution positioning or the usage of percentages didn't help. It looked that it is not possible to cover all the cases without to use JavaScript.

Even if the above problem is solved that will be only 50% of the job, because if the width of the wrapper is less then its height everything starts from the beginning. So, I wasn't able to figure out how to make the things in the CSS styling. I had to change the markup and try again.

### The solution

During the development of [krasimirtsonev.com](http://krasimirtsonev.com) I used *background-size: cover*. What it does is to resize your background image like that so it fills all the available space. So, the first thing which I did is to set the image as a background of the wrapper. 

	<div class="wrapper" style="background-image: url('pic1.jpg');"></div>

Yes, I know that inline styling is not a good idea. Also the missing of *img* tag means that search engines will not parse very well my images. Anyway, the type of the project allows those sacrifices.

After that I added *background-size: cover* to the wrapper's styles:

	.wrapper {
		width: 400px;
        height: 200px;
        overflow: hidden;
        background-size: cover;
	}

Only this property solves half of the problem. After that resizing the image matched my criterias. 

Another useful property is *background-position*. I added *background-position: center center* and voila - mission completed.

<iframe width="100%" height="400" src="http://jsfiddle.net/krasimir/W7GuL/3/embedded/result,css,html/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## Challenge #2 - layouting

The second challenge is actually a well known common task, but it is still difficult. In every project we have different types of layouts. Of course there are some patterns. The idea is to implement them with pure CSS.

### Layout A - everything centered

![CSS Challenge](http://krasimirtsonev.com/blog/articles/CSSChallenge2Layouting/img/layoutA.jpg)

That's maybe the most simplest layout. Usually the markup is something like that:

	<div class="layout-a">
	    <img src="..." />
	    <p>...</p>
	</div>

As you know, if you have container with elements which are inline objects, you could use *text-align: center* to position them in the middle. If you apply this to our wrapper the image will be centered, because it is by default an inline element. Also the text in the paragraph will be centered, because the *&lt;p&gt;* tag inherits the *text-align* from its parent. However our layout is a bit different. First of all the image and the paragraph should be with equal widths. The text should be left aligned and will be nice if we could apply the same CSS with different widths of the container.

Let's imagine that we don't know the width of the image. This means that we can't also set the width of the paragraph. So, we should simply rely on the parent element. By default the *&lt;p&gt;* tag is a block element so its width is 100%. If we apply the same value to the *&lt;img&gt;* tag they will be with equals widths. 

Because we know the wrapper's width we could use *margin: 0 auto* to position it in the center. At the end we should apply *text-align: left* to the paragraph so its text sticks to the left. The final CSS of the layout is:

	.layout-a {
	    width: 360px;
	    margin: 0 auto;
	    text-align: center;
	}
	.layout-a img {
	    width: 100%;
	}
	.layout-a p {
	    text-align: left;
	}

Here is a simple example to play with:

<iframe width="100%" height="300" src="http://jsfiddle.net/krasimir/xZR8D/16/embedded/result,css,html/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

### Layout B - an image and text

![CSS Challenge](http://krasimirtsonev.com/blog/articles/CSSChallenge2Layouting/img/layoutB.jpg)

The requirements here are similar. We know only the width of the container and we should position the image on the left and the text on the right. Also the picture should expand if the wrapper has bigger width.

We should use [floats](http://krasimirtsonev.com/blog/article/css-using-float-property-navigation-layout-composition) here. We could apply *float: left* to the image, but in this case the text will go around the picture. What we want to achieve is to keep the area below the image free. Something like this:

![CSS Challenge](http://krasimirtsonev.com/blog/articles/CSSChallenge2Layouting/img/layoutB3.jpg)

To fix this problem we have to apply 50% width to both, the image and the paragraph. This will make two columns. And if we float them to left we are almost done.

	.layout-b img {
	    width: 50%;
	    float: left;
	}
	.layout-b p {
	    width: 50%;
	    float: left;
	}

We used floats, but we should clear them, because this will break the layout. Instead of adding more markup we may use [:after pseudo class](http://krasimirtsonev.com/blog/article/CSS-before-and-after-pseudo-elements-in-practice). The final CSS looks like that:

	.layout-b {
	    width: 360px;
	    margin: 0 auto;
	}
	.layout-b:after {
	    content: "";
	    display: block;
	    clear: both;
	}
	.layout-b img {
	    width: 50%;
	    float: left;
	}
	.layout-b p {
	    width: 50%;
	    float: left;
	    margin: 0;
	    padding: 0 0 0 10px;
	    -webkit-box-sizing: border-box;
		-moz-box-sizing: border-box;
		box-sizing: border-box;
	}

Notice that I used a little padding in the paragraph styling. Because of that I needed to apply [*box-sizing: border-box*](http://css-tricks.com/box-sizing/). Otherwise those 10px will move the text below the image.

Working example:

<iframe width="100%" height="360" src="http://jsfiddle.net/krasimir/BKuTU/8/embedded/result,css,html/" allowfullscreen="allowfullscreen" frameborder="0"></iframe> 

If you want to have the text on the left and the image on the right then you could just switch the places of the tags in the container. Also you should update the padding of the paragraph, so its *padding-right* property contains 10px.

![CSS Challenge](http://krasimirtsonev.com/blog/articles/CSSChallenge2Layouting/img/layoutB2.jpg)

Of course instead of text you could use another image. They both will take exactly 50% of the wrapper.

![CSS Challenge](http://krasimirtsonev.com/blog/articles/CSSChallenge2Layouting/img/layoutB4.jpg)

### Layout C - a bit complex

![CSS Challenge](http://krasimirtsonev.com/blog/articles/CSSChallenge2Layouting/img/layoutC.jpg)

Two images and little text. It's almost like the previous layout, but we need more markup.

	<div class="layout-c">
	    <img src="..." />
	    <div class="layout-c-right">
	        <img src="..." />
	        <p>...</p>
	    </div>
	</div>

As you may guess, we still have two columns, but this time there is a conflict. If we apply *width: 50%; float: left;* to the &lt;img&gt; tag it will be valid for the image inside the nested container *.layout-c-right*. That's why we should overwrite this style and the layout's CSS transforms to:

	.layout-c {
	    width: 360px;
	    margin: 0 auto;
	}
	.layout-c:after {
	    content: "";
	    display: block;
	    clear: both;
	}
	.layout-c img {
	    width: 50%;
	    float: left;
	}
	.layout-c-right {
	    float: left;
	    width: 50%;
	}
	.layout-c-right img {
	    width: 100%;
	    float: none;
	}
	.layout-c p {
	    margin: 0;
	    padding: 5px 0 0 10px;
	    -webkit-box-sizing: border-box;
		-moz-box-sizing: border-box;
		box-sizing: border-box;
	}

The result is exactly what we wanted:

<iframe width="100%" height="340" src="http://jsfiddle.net/krasimir/6SJnU/2/embedded/result,css,html/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

Same like in layout B, if you want to switch the positions of the columns you just have to change their order in the DOM. And of course update the padding of the paragraph.

![CSS Challenge](http://krasimirtsonev.com/blog/articles/CSSChallenge2Layouting/img/layoutC2.jpg)

### Layout D - many columns and space between them

![CSS Challenge](http://krasimirtsonev.com/blog/articles/CSSChallenge2Layouting/img/layoutD.jpg)

It's not that simple as it looks like. Of course, we will use floats, so we should keep the clearing. In our case we have three columns, so every of them have to take exactly 33.33% of the whole width. The markup that we are using is:

	<div class="layout-d">
	    <div class="layout-d-column">
	        <img src="..." />
	        <p>...</p>
	    </div>
	    <div class="layout-d-column">
	        <img src="..." />
	        <p>...</p>
	    </div>
	    <div class="layout-d-column">
	        <img src="..." />
	        <p>...</p>
	    </div>
	</div>

There should be some space between the columns. By using padding and box-sizing we could achieve this:

	.layout-d-column {
	    width: 33.33%;
	    float: left;
	    padding: 0 20px 0 0;
	    -webkit-box-sizing: border-box;
	    -moz-box-sizing: border-box;
	    box-sizing: border-box;
	}

If you try the things so far you will notice that the third column is not positioned to the very right side of the wrapper. That's because those 20px padding. Hopefully there is a way to fix that. And again with pure CSS. The idea is to play with the paddings like that so the columns have equal widths. Here is the final result:

	.layout-d {
	    width: 500px;
	    margin: 0 auto;
	    border: solid 1px #000;
	}
	.layout-d:after {
	    content: "";
	    display: block;
	    clear: both;
	}
	.layout-d-column {
	    width: 33.33%;
	    float: left;
	    padding: 0 5px 0 5px;
	    -webkit-box-sizing: border-box;
	    -moz-box-sizing: border-box;
	    box-sizing: border-box;
	}
	.layout-d-column:last-child {
	    padding: 0 0 0 10px;
	}
	.layout-d-column:first-child {
	    padding: 0 10px 0 0;
	}
	.layout-d-column img {
	    width: 100%;
	}
	.layout-d-column p {
	    padding: 10px 0 0 0;
	    margin: 0;
	}

<iframe width="100%" height="300" src="http://jsfiddle.net/krasimir/nzQgq/4/embedded/result,css,html/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

The layout solution works with more columns as well. What you have to do is to update the width of *.layout-d-column*. For example the preview below uses 25%:

<iframe width="100%" height="300" src="http://jsfiddle.net/krasimir/tL9qn/3/embedded/result,css,html/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## Conclusion

I'm big fen of [KISS principle](http://en.wikipedia.org/wiki/KISS_principle). I always try to avoid the usage of additional library. Like for example jQuery. It's a wonderful instrument, but in most of the cases you just don't need it. Removing a library from the project is quite good progress, but removing a whole technology is even better. Solving problems with pure CSS brings a lot of benefits - better performance, easy to transfer and maintain. I strongly recommend investing time in such solutions, because they will make our life easier. I believe that JavaScript should not be used for the presentational part of the applications. It's a tool, which you can use to implement business logic. So, use CSS to make the things look pretty and share your daily challenges. 