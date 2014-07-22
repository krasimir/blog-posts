# SASS: universal mixin for box model properties 

I'm currently working on OrganicCSS - a micro framework based on [atomic CSS](http://coding.smashingmagazine.com/2013/08/02/other-interface-atomic-design-sass/) concept. I'm thinking a lot for name conventions, classes and of course mixins. I decided to combine three mixins in a file called *_box-model.scss*. They will provide a shortcuts for margin, padding and border properties.

That's what I start from:

	@mixin margin($values...) {
		margin: $values;
	}
	@mixin padding($values...) {
		padding: $values;
	}
	@mixin border($values...) {
		border: $values;
	}

I could say that for margin and padding such kind of mixin is good enough. However the border once is not flexible at all. That's because very often I set only *border-top* property. So, instead of that I decided to pass four parameters and transform the code to

	@mixin border($top, $right, $bottom, $left) {
		border-top: $top;
		border-right: $right;
		border-bottom: $bottom;
		border-left: $left;
	}

But now it requires four arguments to be passed. That's not good, because I'll have to write more, which is exactly the opposite of what I was trying to achieve. Thankfully [SASS](http://krasimirtsonev.com/blog/search?search_for=sass) offers default values for the mixin's parameters and this helps a lot.

	@mixin border($top: none, $right: none, $bottom: none, $left: none) {
		border-top: $top;
		border-right: $right;
		border-bottom: $bottom;
		border-left: $left;
	}

So, the mixin changes several times and I simply wrote a short list of requirements, which I want to accomplish:

  - should accept no arguments
  - should reset the property
  - should support applying value to only certain versions of the property (i.e. *border-left*, *border-right* etc ...)
  - it should be possible to pass only one parameter and apply it to all the versions sides

A good check list, isn't it. The first one could be covered if I define default values for all the arguments. The second one is also doable if the defaults are properly selected. And the fact that I have predefined values means that I'm able to send only the last property, so the third point could be also marked as done. The last one is a little bit tricky and require the usage of [@if directive](http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#id10). Here is the final version:

	@mixin border($top: none, $right: none, $bottom: none, $left: none) {
		border-top: $top;
		@if $right == none {
			border-right: $top;
		} @else {
			border-right: $right;
		}
		@if $bottom == none {
			border-bottom: $top;
		} @else {
			border-bottom: $bottom;
		}
		@if $left == none {
			border-left: $top;
		} @else {
			border-left: $left;
		}
	}

I used the same concept for padding and margin mixins.