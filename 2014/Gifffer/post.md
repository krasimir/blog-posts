# Stop autoplaying your Gifs

This blog has 460 posts. In some of them, I need to show video clips demonstrating some feature or browser behaviour. I found that it was much better to do that in an animated Gif. However, they play automatically which is kinda annoying. Imagine that we have ten Gifs on the page and while you are reading they all blink or show moving content. It's like having a page full with banners. 

## The solution

I ended up with fairly simple solution. To be more accurate - 1.5K JavaScript library called [Gifffer](https://github.com/krasimir/gifffer). It has only one simple task. It should replace my <i>&lt;img&gt;</i> tag with a stop/play controllable version of the animated Gif. Here is how it looks:

<img data-gifffer="http://work.krasimirtsonev.com/git/gifffer/example/image.gif" />

The workaround was inspired by [this answer](http://stackoverflow.com/a/4276742/642670) at StackOverflow. [Gifffer](https://github.com/krasimir/gifffer) waits till the image is fully loaded. It makes a <i>screenshot</i> of one of the first frames and replaces the original tag with a <i>&lt;div&gt;</i> element. When the user clicks on it the animation starts, and if he clicks again it stops.

## Usage

Just include the library in your page:

    <script type="text/javascript" src="gifffer.min.js"></script>

Instead of setting <i>src</i> attribute on your image use <i>data-gifffer</i>.

    <img data-gifffer="image.gif" />

At the end, call <i>Gifffer()</i> whenever you want. For example:

    window.onload = function() {
        Gifffer();
    }

## Download

The library is available at GitHub [here](https://github.com/krasimir/gifffer). The file that you need is [gifffer.min.js](https://raw.githubusercontent.com/krasimir/gifffer/master/build/gifffer.min.js). 