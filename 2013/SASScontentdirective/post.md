# SASS: @content directive is a wonderful thing

I just started using [SASS](http://sass-lang.com/) and I love it. A bunch of cool features, which will help me improve my CSS coding. [@content](http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#mixin-content) directive is one of them.

Let's say that you want to define various types of buttons. The base class may look like that:

	@mixin button {
		display: block;
		font-size: 20px;
		text-decoration: none;
	}

The regular button just includes the mixin, but for example the *delete* button needs a red colored text. So, we should change the definition a bit and write:

	@mixin button($color: #000) {
		display: block;
		font-size: 20px;
		text-decoration: none;
		color: $color;
	}
	.alert {
		@include button(#F00);
	}

By doing this we are able to pass the color and basically create another type of button. So far so good, but the *cancel* type of button may need a gray border and we need to add another parameter.

	@mixin button($color: #000, $border: none) {
		display: block;
		font-size: 20px;
		text-decoration: none;
		color: $color;
		border: $border;
	}
	.alert {
		@include button(#F00);
	}
	.cancel {
		@include button(#000, solid 1px #999);
	}

I hope you already saw the problem. We can't continue adding more and more arguments to our base class, because it is not very efficient. There is also code duplication at the end. That's the perfect place for the @content directive. We are able to remove the parameters and use the mixin like that:

	@mixin button() {
		display: block;
		font-size: 20px;
		text-decoration: none;
		@content;
	}

	.alert {
		@include button {
			color: #F00;
		}
	}
	.cancel {
		@include button {
			border: solid 1px #999;
		}	
	}

The result is:

	.alert {
		display: block;
		font-size: 20px;
		text-decoration: none;
		color: #F00;
	}
	.cancel {
		display: block;
		font-size: 20px;
		text-decoration: none;
		border: solid 1px #999;
	}

If we keep the old version with the parameters the *.alert* class will contain *border: none;* and in practice, that line is not needed. It's the same with the *.cancel* button and *color* property.

I found another interesting use case  while browsing [inuitcss](http://inuitcss.com/) framework by [Harry Roberts](http://csswizardry.com/). I landed on the following mixin:

	@mixin keyframes ($animation-name) {
	    @-webkit-keyframes $animation-name{
	        @content;
	    }
	    @-moz-keyframes $animation-name{
	        @content;
	    }
	    @-ms-keyframes $animation-name{
	        @content;
	    }
	    @-o-keyframes $animation-name{
	        @content;
	    }
	    @keyframes $animation-name{
	        @content;
	    }
	}

It helps you if you want to create an [animation](http://krasimirtsonev.com/blog/article/Introduction-to-animations-in-HTML-css3-transitions-keyframes). All those browser prefixes are really annoying, so it is nice that you can combine them in a mixin. You are able to use it like that:

	p {
		@include keyframes("my-anim") {
			0% { font-size: 20px; }
			100% { font-size: 30px; }
		}
	}

You pass the name of your animation along with the frames definition. SASS compiler produces:

	p {
		@-webkit-keyframes my-anim {
			0% { font-size: 20px; }
			100% { font-size: 30px; }
		}
		@-moz-keyframes my-anim {
			0% { font-size: 20px; }
			100% { font-size: 30px; }
		}
		@-ms-keyframes my-anim {
			0% { font-size: 20px; }
			100% { font-size: 30px; }
		}
		@-o-keyframes my-anim {
			0% { font-size: 20px; }
			100% { font-size: 30px; }
		}
		@keyframes my-anim {
			0% { font-size: 20px; }
			100% { font-size: 30px; }
		}
	}