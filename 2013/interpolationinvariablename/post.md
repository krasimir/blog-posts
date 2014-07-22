# SASS: interpolation in a name of variable

I just answered on that [question](http://stackoverflow.com/questions/18501130/is-it-possible-to-nest-variables-within-variables-in-sass) at StackOverflow. That's actually asked a lot last few months.

## The problem

In SASS we could make interpolation like that:

	@mixin set-border($side) {
		border-#{$side}: solid 1px #000;
	}
	.header {
		@include set-border("top");
	}
	
This is compiled to:

	.header { border-top: solid 1px #000; }

The idea is to use a variable and construct another thing. However it is currently [not possible](http://krasimirtsonev.com/blog/article/Two-handy-and-advanced-SASS-features-and-their-limitations) to use interpolation in names of mixins or variables. For example, the following will not work.

	$bg-dark: #000;
	$bg-white: #FFF;
	@mixin set-styles($arg) {
		background-color: $bg-#{$arg};
	}
	.header {
		@include set-styles("dark");
	}

If you try to compile this you will get

	Sass Error: Undefined variable: "$bg-".

## The solution

However, there is a solution for that. You may use placeholders. The interpolation works in there. So, instead of variables you define placeholders.

	%bg-dark {
		background-color: #000;
	}
	%bg-white{
		background-color: #FFF;
	}
	@mixin set-styles($arg) {
		@extend %bg-#{$arg};
	}
	.header {
		@include set-styles("dark");
	}

The compilation passes and the result is:

	.header { background-color: #000; }