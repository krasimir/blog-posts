# SASS mixin for media queries

These days I'm working on [this](https://github.com/krasimir/organic-css) little thing. It's a CSS micro framework following [atomic](http://bradfrostweb.com/blog/post/atomic-web-design/) concept. My preprocessor of choice is SASS. That's why I wrote several [articles](http://krasimirtsonev.com/blog/search?search_for=sass) on this subject. Today's post is about media queries mixin.

First of all I totally agree with the following tweet by [Aral Balkan](https://twitter.com/aral)

<blockquote class="twitter-tweet"><p>…I don’t even like the name ‘element queries’. These aren’t queries. These are *break points*. Call them that. Call them break points.</p>&mdash; Aral Balkan (@aral) <a href="https://twitter.com/aral/statuses/363775523975360512">August 3, 2013</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

Media queries should be called break points. That's what we actually think of when we work with them. The mixin in SASS is something which will be used a lot of times, so its name matters. I decided to use *break-point* as a part of the definition. I saw several variants of such mixins and some of them use *max-width*, *min-width* or even *wide-screen* and *ipad*. I hope you know that linking your media queries to specific device screen resolution is wrong. You should reconstruct your styles based on the content and how it looks like. This means that you could have *650px* as a break point for your header, but at the same time the content looks ok. Of course this means that the content could be broken at *569px* and you have to add a new media query for that. 

Very often I'm not sure what *min-width* and *max-width* means. I directly replace them with *lower* and *higher*. So, here are the first two mixins:

	@mixin break-point-lower-than($point) {
		@media all and (max-width: $point) {
			@content;
		}
	}
	@mixin break-point-higher-than($point) {
		@media all and (min-width: $point) {
			@content;
		}
	}

And a simple use case:

	.header {
		font-size: 24px;
		@include break-point-higher-than(450px) {
			font-size: 30px;
		}
	}

This is compiled to:

	.login-box {
		font-size: 24px;
	}
	@media all and (min-width: 450px) {
		.login-box {
			font-size: 30px;
		}
	}

Having these two mixins I immediately create a new one combining two break points:

	@mixin break-point-range($point-from, $point-to) {
		@media all and (min-width: $point-from) and (max-width: $point-to) {
			@content;
		}
	}

Actually all the things above are valid for SASS 3.2. Two very important changes were made:

  - [interpolation](http://krasimirtsonev.com/blog/article/Two-handy-and-advanced-SASS-features-and-their-limitations) in the media query definition
  - allowing the usage of @content inside the body of the query

A nice little feature is also the bubbling effect. I mean the fact that you can write the media query into the body of your selector. I find this very helpful. It keeps the component and its media query changes in one place.

However, there are things which you can't do. You can't use @extend or @include inside media query. This means that you have to type every style which you want to change manually even if you have a mixin or placeholder for that.