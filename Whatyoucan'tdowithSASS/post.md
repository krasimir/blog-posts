# Two handy SASS features and their limitations

I really like [SASS](http://krasimirtsonev.com/blog/search?search_for=SASS) and I use it a lot in my daily job. There are tons of useful features. However there are some things which I want to do, but I can't. There are limitation in the syntax and missing functionalities. Sharing what I found, I want to know if you meet those limitation and how you get around them.

## Interpolation

One of the main reasons to use CSS preprocessor is that you want to get a better architecture. I.e. you want to write good looking, efficient and object oriented CSS. The interpolation in SASS is important part of this process. Let's get the following example:

	$properties: (margin, padding);
	@mixin set-value($side, $value) {
		@each $prop in $properties {
			#{$prop}-#{$side}: $value;
		}
	}
	.login-box {
		@include set-value(top, 14px);
	}

It works pretty well with variables and properties. The snippet above is compiled to:

	.login-box {
		margin-top: 14px;
		padding-top: 14px;
	}

That's the trivial use case of interpolation in SASS. You have strings and you use them while you set values to properties. Another useful usage is to construct a selector. Something like that also works:

	@mixin generate-sizes($class, $small, $medium, $big) {
		.#{$class}-small { font-size: $small; }
		.#{$class}-medium { font-size: $medium; }
		.#{$class}-big { font-size: $big; }
	}
	@include generate-sizes("header-text", 12px, 20px, 40px);

It produces:

	.header-text-small { font-size: 12px; }
	.header-text-medium { font-size: 20px; }
	.header-text-big { font-size: 40px; }

Once you find this you immediately start thinking about super cool mixins, which generate tons of code or maybe produce another mixins. However, that's not exactly possible. The first limitation, which could be removed soon is an interpolation used in a name of SASS variable.

	$margin-big: 40px;
	$margin-medium: 20px;
	$margin-small: 12px;
	@mixin set-value($size) {
		margin-top: $margin-#{$size};
	}
	.login-box {
		@include set-value(big);
	}

If you try to use the code above you will get:

	Syntax error: Undefined variable: "$margin-".

So, the nice *#{}* syntax is not available for everywhere. You can't use it while you call a mixin too:

	@mixin updated-status {
		margin-top: 20px;
		background: #F00;
	}
	$flag: "status";
	.navigation {
		@include updated-#{$flag};
	}

The compilation ends up with:

	Syntax error: Invalid CSS after "@include updated-": expected "}", was "#{$flag};"

The good news is that you can use interpolation with @extends directive. For example:

	%updated-status {
		margin-top: 20px;
		background: #F00;
	}
	.selected-status {
		font-weight: bold;
	}
	$flag: "status";
	.navigation {
		@extend %updated-#{$flag};
		@extend .selected-#{$flag};
	}

It's good that this works, because it gives us the power to dynamically generate classes or placeholders, which could be use later. Of course they don't accept parameters like the mixins. The result of the lines above is:

	.navigation {
		margin-top: 20px;
		background: #F00;
	}
	.selected-status, .navigation {
		font-weight: bold;
	}

The SASS community is [actively discussing](https://github.com/nex3/sass/issues/626) the interpolation limitations and who knows, maybe very soon we will be able to use those techniques.

## Using list as a source for generator

The lists are really helpful if you need to pass unknown amount of parameters to function or mixin. Before a couple of days I met a problem, which I wasn't able to solve and I had to change my SASS architecture. Let's get the following code:

	%margin-reset { margin: 0; }
	%padding-reset { padding: 0; }
	%size-reset { width: 100%; height: 100%; }
	@mixin add-styles($items) {
		@each $item in $items {
			@extend %#{$item};
		}
	}
	.footer, .header, .login-box {
		@include add-styles((
			margin-reset,
			padding-reset,
			size-reset
		));
	}

After the compilation the CSS looks like that:

	.footer, .header, .login-box {
		margin: 0;
	}
	.footer, .header, .login-box {
		padding: 0;
	}
	.footer, .header, .login-box {
		width: 100%;
		height: 100%;
	}

So far, so good. Now I'm able to extend as many placeholders as I want. But what about mixins? Can I, instead of placeholders, send mixin names? The first problem is that the mixins accept parameters (if you have one which doesn't do that you have to consider refactoring). As you already saw, the main idea is to pass a list, which later is read element by element. Every element could be a mixin or placeholder. I found only one way to distinguish them. If I need to extend a placeholder I'm passing only its name. Otherwise I'm passing another list containing the name of the mixin and its arguments. For example:

	@mixin border-solid($width, $color) {
		border: solid #{$width} #{$color};
	}
	...
	.footer, .header, .login-box {
		@include add-styles((
			margin-reset,
			padding-reset,
			size-reset,
			(border-solid, 3px, #F90)
		));
	}

So, while I'm going through all the items in the list I have to check if the current one is a list. Thankfully there is a function called *type_of* and it returns the type of the passed variable.
	
	@mixin add-styles($items) {
		@each $item in $items {
			@if type_of($item) == "list" {
				// call a mixin
			} @else {
				@extend %#{$item};
			}
		}
	}

As I said, in the first part of this article, we can't use interpolation while the including of a mixin. Code like this is actually wrong:

	@include #{$item}();

As far as I know, there is no solution for that and I came with a simple if-else markup:
	
	@mixin add-styles($items) {
		@each $item in $items {
			@if type_of($item) == "list" {
				@if nth($item, 1) == "border-solid" {
					@include border-solid(nth($item, 2), nth($item, 3));
				}
			} @else {
				@extend %#{$item};
			}
		}
	}

Of course I wasn't happy with the code. Mainly because I had to describe every single mixin inside *add-style*. Anyway, I was ready to use it like that, but even this version didn't work. Once I remove the placeholders and sent only *(border-solid, 3px, #F90)* I got:

	Syntax error: Invalid CSS after "%": expected placeholder name, was "3px"

And that's because if you have a list with only one element it is cast to a string and my check *@if type_of($item) == "list"* didn't work. It goes to the *@else* statement and tries to extend a placeholder.
