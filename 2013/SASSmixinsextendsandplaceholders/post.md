# SASS mixins, extends and placeholders 

I used [LESS](http://lesscss.org/) a lot. These days I decided to try [SASS](http://sass-lang.com/) and to be honest it's a better choice for CSS preprocessor. It just gives me more functionalities and better control on my code. There are few instruments for architecting your CSS logic - [@mixin](http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#mixins), [@extend](http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#extend) and [placeholders](http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#placeholder_selectors_). However there are differences between them and specific use cases.

# @mixin

Here is how the mixin works. The definition and usage:

	@mixin awesome {
		width: 100%;
		height: 100%;
	}

	body {
		@include awesome;
	}
	p {
		@include awesome;
	}

The snippets above produce the following code.

	body {
		width: 100%;
		height: 100%;
	}
	p {
		width: 100%;
		height: 100%;
	}

The make the things a little bit more interesting we could make our mixin accepting parameters. Even better we are able to define default values if the mixin is called without arguments.

	@mixin awesome($w: 100%, $h: 100%) {
		width: $w;
		height: $h;
	}

	body {
		@include awesome(960px);
	}
	p {
		@include awesome;
	}


The result will be similar, but the width of the body is different.

	body {
		width: 960px;
		height: 100%;
	}
	p {
		width: 100%;
		height: 100%;
	}

I'm not saying anything new. There are bunch of [articles](http://net.tutsplus.com/?s=sass) about SASS and how to use it. What I want to draw attention to is the fact that the produced CSS is not following the [DRY principle](http://en.wikipedia.org/wiki/Don't_repeat_yourself). I.e. if you use mixins the styles in them are duplicated all over your classes. The mixins are very helpful if you need to change or calculate something in the final output. For example if you need to apply *border-radius* to several elements and you don't want to write all the browser specific prefixes, you probably use something like that:

	@mixin radius($radius){
		border-radius: $radius;
		-o-border-radius: $radius;
		-ms-border-radius: $radius;
		-moz-border-radius: $radius;
		-webkit-border-radius: $radius;
	}
	.navigation {
		@include radius(10px);
	}
	.content {
		@include radius(32px);
	}

Mixins are well fitting here, because at the end you have different value applied. However, as I said, in some other cases there is a lot of duplicating code, which could be avoided if you use @extend or placeholders.

## @extend

	.awesome {
		width: 100%;
		height: 100%;
	}

	body {
		@extend .awesome;
	}
	p {
		@extend .awesome;
	}

It's similar, isn't it. In SASS it looks almost identical, but in the CSS the result is:

	.awesome, body, p {
		width: 100%;
		height: 100%;
	}

Shorten then the version using a mixin. You can't pass parameters during the extending, but that's not the idea actually. @extend should be used in those places where you want to share properties between the elements. 

The final code is still not perfect. That's because the the *.awesome* class is also written in our final *.css* file. You may not use it at all, so it will be good if it is hidden. To achieve this you could use placeholders.

## Placeholders

Placeholders are fresh features of SASS. Added in version 3.2 they look like that:

	%awesome {
		width: 100%;
		height: 100%;
	}
	body {
		@extend %awesome;
	}
	p {
		@extend %awesome;
	}

The output is just:

	body, p {
		width: 100%;
		height: 100%;
	}

The preprocessor just skips *%awesome* and doesn't include it in the final CSS file. You may ask "Is that mean that we should use placeholders only?". The answer is "It depends.". You may have class *.button* and in some cases apply it directly to DOM elements. Together with that, you will probably need *.button-cancel* and *.button-ok*. In these cases, you will want to extend it and change just the color of the links.

## Conclusion

SASS is wonderful new language. Its main features @mixin, @extend and placeholders have pros and cons, but it is good to know that every of them has its own use cases.