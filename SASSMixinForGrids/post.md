# SASS mixin for grid generation

The mixins in [SASS](http://krasimirtsonev.com/blog/search?search_for=sass) are really helpful. Here is something really short which I just start using. It's a mixin which I apply on the grid's container.

	@mixin grid($columns: 2, $tag: "div") {
		#{$tag} {
			width: 100% / $columns;
			box-sizing: border-box;
			-moz-box-sizing: border-box;
			float: left;
		}
		&:after {
			display: table;
			content: " ";
			clear: both;
			*zoom: 1;
		}
	}

You may use it like that:

	// html
	<section class="wrapper">
		<div>column1</div>
		<div>column2</div>
		<div>column3</div>
		<div>column4</div>
	</section>

	// sass
	.wrapper {
	   @include grid(4);
	}

What it does is to set the proper width of the columns. Together with that floats them and it adds a clearfix at the end. The mixin accepts two arguments. The first one determines the number of the columns and the second one the type of the child tags.

For example, the following:

	.wrapper {
	   @include grid(5, 'p');
	}

is compiled to

	.wrapper p {
		width: 20%;
		box-sizing: border-box;
		-moz-box-sizing: border-box;
		float: left; 
	}
	.wrapper:after {
		display: table;
		content: " ";
		clear: both;
		*zoom: 1; 
	}

