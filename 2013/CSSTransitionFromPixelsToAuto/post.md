As you may know I just updated my [web site](http://krasimirtsonev.com/main/). There are five columns which nicely slide up and down on a lower resolution. In other words, accordion-like navigation. Initially I made this effect with JavaScript. But there was a bug and I decided to use pure CSS. I wanted to define everything in CSS classes which to add or remove. The idea wasn't bad except the fact that every column contains dynamic content and I wasn't able to set the exact height when the column is slided down. 

![CSSTransitionFromPixelsToAuto](http://krasimirtsonev.com/blog/articles/CSSTransitionFromPixelsToAuto/image.jpg)

I knew that I can set height to *auto* and the DOM element will enlarge to show the content in it. However this will not work good with transitions. That's because the browser needs numbers to calculate the animation. The problem is illustrated in the following jsfiddle

<iframe width="100%" height="300" src="http://jsfiddle.net/krasimir/B73Dv/2/embedded/result,js,html,css/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

The solution of the problem is to use *max-height* instead of *height*. I.e. when the column is slided down I had to set *max-height* to a very big value and the element will stretch. Here is an example following this approach:

<iframe width="100%" height="300" src="http://jsfiddle.net/krasimir/a3Nqn/3/embedded/result,js,html,css/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

Of course the problem is not completely solved, because the animation is too fast or too slow. This depends on the content. Anyway, it looks good in my case, it's not buggy and it's only (almost) CSS.