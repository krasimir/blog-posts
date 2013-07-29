# HTML Animations (the proper way) 

Last few years designers use a lot of animations directly in the [HTML](http://krasimirtsonev.com/blog/category/HTML5). That's of course kinda cool, because you don't need a plugin in order to see their work. There are several ways to make animations in HTML. It's an interesting subject and I decided to make a short research and summarize the information.

I spend several years in [Flash development](http://krasimirtsonev.com/blog/category/ActionScript). To make an animation there you have to generate different static images and display them in a sequence. That's how the illusion of movement is created. The same approach is valid for HTML. For example, if you have five seconds and increase the width of a DOM element five times with 20px the result will be an animation.

## JavaScript way

The popular way to make animations is to use JavaScript. I.e. create a function, which executes again and again and changes something. 

	var width = 100;
    var to = 200;
    var loop = function() {
        if(++width < to) {
            element.style.width = width + "px";
            setTimeout(loop, 1);
        }
    }
    loop();	

The result is something like this:

<iframe width="100%" height="180" src="http://jsfiddle.net/krasimir/gvn9d/8/embedded/result,js,html,css/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

As far as I know jQuery uses similar approach for its [*.animate*](http://api.jquery.com/animate/) method. For a good amount of time this was enough. I mean, it was kinda popular way to create animations in HTML. The good thing is that you have control on the whole process. You know when the animation starts and when exactly ends. You could decide to make something else in the middle of it or 20% before it finishes. 

Of course creating linear movements is not enough. That's why, we have ease functions. I.e. functions which change the values applied to the element like that so it looks more interesting. In the world of Flash, [Robert Penner](http://www.robertpenner.com/easing/) made a big *boom* by introducing his easing methods. The same idea was later moved to JavaScript and today there is even a [plugin](http://gsgd.co.uk/sandbox/jquery/easing/) for jQuery. 

So, how could we use easing? Let's say that we want to change a div's width from 0px to 10px in 10 steps. If we use linear movement the values, which we have to apply will look like that:

	step 1 - 1px
	step 2 - 2px
	step 3 - 3px
	step 4 - 4px
	step 5 - 5px
	step 6 - 6px
	step 7 - 7px
	step 8 - 8px
	step 9 - 9px
	step 10 - 10px

It's a simple math isn't it. However, if we have a little bit more complex numbers like for example from 232px to 306px in 14 steps we definitely need a helper function. It could be something like this:

	var calcAnimation = function(from, to, steps) {
        var diff = Math.abs(to - from);
        var res = [];
        var valuePerStep = diff / steps;
        from += valuePerStep;
        for(var i=0; i<steps; i++) {
            res.push(from + (i * valuePerStep));
        }
        return res;
    }

The function gets the initial value, target value and number of steps. It returns an array containing all the values that should be applied. For example:

	calcAnimation(0, 10, 10) // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
	calcAnimation(0, 20, 5) // [4, 8, 12, 16, 20]
	calcAnimation(-10, 10, 10) // [-8, -6, -4, -2, 0, 2, 4, 6, 8, 10]

The example above could be translated to the following version:

    var animation = {from: 100, to: 200, steps: 50};
    var values = calcAnimation(animation.from, animation.to, animation.steps);
    var currentIndex = 0;
    var loop = function() {
        if(currentIndex < values.length) {
            element.style.width = values[currentIndex] + "px";
            currentIndex += 1;
            setTimeout(loop, 1);
        }
    }
    loop();

As I said the *calcAnimation* function brings a linear type of movement. It's like that, because we used the most simple calculation of the values. Once we get the difference between the starting and ending point we divide it to the number of steps. The result is a number, which we have to apply to the property on every step. Luckily we are able to replace our simple calculation with a better function. For example:

	var calcAnimationOutElastic = function(from, to, steps) {
        var InOutElastic = function(t, b, c, d, a, p) {
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (!a || a < Math.abs(c)) { a=c; var s = p/4; }
            else s = p/(2*Math.PI) * Math.asin (c/a);
            return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
        }
        var res = [];
        for(var i=0; i<steps; i++) {
            res.push(InOutElastic(i, from, to, steps, 0, 0));
        }
        return res;
    } 

The result is:

<iframe width="100%" height="180" src="http://jsfiddle.net/krasimir/XCDzS/4/embedded/result,js,html,css/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

Don't try to understand the math behind *InOutElastic* method. It is actually not necessary. You just need to know that it returns a value, which you have to apply.

## CSS way

You maybe hear that before, but *native is always faster*. And yes, it is. There are a lot of benchmarks showing that CSS3 animations are faster then their JavaSciprt equivalent. [Here](http://css3.bradshawenterprises.com/blog/jquery-vs-css3-transitions/) is a small experiment proving that. 

There are two ways to create animations with CSS - [transitions](http://www.w3schools.com/css3/css3_transitions.asp) and [animations](http://www.w3schools.com/css3/css3_animations.asp). CSS transitions require two properties to be set - *transition-property* and *transition-duration*

	transition-property: background;
    transition-duration: 500ms;

(For the sake of simplicity I'll skip the browser specific prefixes)

Here is an example. Because transition properties are added the background color is changed smoothly.

<iframe width="100%" height="180" src="http://jsfiddle.net/krasimir/EcFQF/2/embedded/result,js,html,css/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

If you have several properties for animating you could split them with commas.

There is also CSS animation. It gives you ability to determine the values in different moments of the process. Not, only in the beginning and in the end. A simple example:

	@keyframes 'bg-animation' {
        0% { background: #C9C9C9; }
        50% { background: #61BE50; }
        100% { background: #C9C9C9; }
    }
    .star:hover {
        animation-name: 'bg-animation';
        animation-duration: 2s;
        animation-iteration-count: infinite;
    }

I.e. you could apply different values during the animation.

<iframe width="100%" height="180" src="http://jsfiddle.net/krasimir/fQqqY/2/embedded/result,js,html,css/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

It is clear that CSS animations are better choice, but it also it is clear that there are some disadvantages like:

  - You can't stop or pause animations
  - The syntax is not so nice
  - It is a little bit difficult to sync different animations

## The proper way

My opinion is that we should stick to CSS transitions for the simple hover or show/hide animations. And use CSS animations for complex cases. That's because we are searching for good performance. If we decide to use only JavaScript then our coding job will be easier, but the final result will look bad.

### Understanding how to start an animation

Normally you know how your final frame should look like. You have to create new CSS class with all the values of that final frame. After that just add the class to the element and remove it when you want to return to the initial state. The adding of the class will automatically start the process.

	var element = document.querySelector(".star");
    element.addEventListener("mouseover", function() {
        if(element.className.indexOf('star-hover') === -1) {
            element.className += ' star-hover';
        }
    });
    element.addEventListener("mouseout", function() {
        element.className = element.className.replace(/ star-hover/g, '');
    });

The following jsfiddle uses the code above:

<iframe width="100%" height="180" src="http://jsfiddle.net/krasimir/KpKgs/2/embedded/result,js,html,css/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

### Catching the end of the animation

That's critical part for creating complex animations. Every browser has its own name of the event which is fired, but with the following code you are able to write a cross-browser solution. Similar technique is used in [Modernizr](http://modernizr.com/).

	function whichTransitionEvent(el){
        var t;
        var transitions = {
          'transition':'transitionend',
          'OTransition':'oTransitionEnd',
          'MozTransition':'transitionend',
          'WebkitTransition':'webkitTransitionEnd'
        }

        for(t in transitions){
            if( el.style[t] !== undefined ){
                return transitions[t];
            }
        }
    }
    var transitionEnd = whichTransitionEvent(element);
    element.addEventListener(transitionEnd, function(event) {
        if(element.className.indexOf('star-expand') === -1) {
            element.className += ' star-expand';
        }
    }); 

The following widget shows the event in action. If you click on the star you will see that firstly the color is changed and after that the width of the box is increased. That's because two new CSS classes are added one after the other.

<iframe width="100%" height="180" src="http://jsfiddle.net/krasimir/7rtCB/6/embedded/result,js,html,css/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

Having in mind that the handler of the event receives and object which contains information about the animation. Like for example which property is changed, elapsed time and so on.

### Be creative

I strongly recommend to check [Animate.css](http://daneden.me/animate/). It is a collection of CSS classes, which you can you. They apply some nice transitions to your elements.