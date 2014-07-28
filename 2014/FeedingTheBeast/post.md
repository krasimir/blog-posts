# Feeding the beast at 60fps

The browsers nowadays are smart. They optimize everything and help us to produce better applications. They process our code as fast as possible and even on mobile devices deliver a pleasant experience. However, at the same time, it is possible to write buggy code and make the browser freezing. We are not talking about slowing down the rendering. We are talking about no rendering at all. There are cases where we want so much from the browser that it just can't handle it.

## Processing hundreds of DOM elements

I am working on an [extension](https://github.com/krasimir/modulize) of Chrome that analyzes the CSS applied to the current page. I need to know every single CSS class used in the HTML tags. So, I have to go through the whole tree and get data from every element. I know, it sounds insane but I need to do it. There is no short way or tricky hack that I can apply. I just need to read every single tag and its attributes in order to implement my ideas. I started with the following code:

```js
var processed = 0;
(function parse(e) {
    if(e.nodeType !== 1 || e.nodeName == 'SCRIPT') return;
    processed++;
    console.log(e.nodeName.toLowerCase() + ' (' + processed + ')');
    // using e.getAttributes ...
    for(var i=0; i<e.childNodes.length; i++) {
        parse(e.childNodes[i]);
    }
})(document.querySelector('body'));
```

We have a simple recursion. The root element is the `<body>` tag. We call the `parse` function again and again till there is no more child nodes available. We are also skipping the `script` tags because we are not interested in their content. Let's get the following markup and run the script:

```html
<div class="content">
    <h1>Title</h1>
    <ul>
        <li>A</li>
        <li>B</li>
        <li>C</li>
    </ul>
</div>
<div class="footer">
    <p>Lorem ipsum dolor ...</p>
</div>
```

The result in the console is:

```js
body (1)
div (2)
h1 (3)
ul (4)
li (5)
li (6)
li (7)
div (8)
p (9)
```

Hey, it looks like it is working. I used this code for awhile and based all my logic on it. Everything was ok till I decided to test with real web site. I opened Facebook and run my extension. Yes, my browser was not responding for roughly 10 seconds. It was obvious that there are more than 9 DOM nodes on the page, and my code was *kind of* wrong. 

I did not think about optimization algorithms or tricky hacks. I started thinking about the processes happening in the browser and the real reason behind that freeze. I knew that the browser is trying to render data to the screen in 60 frames per second. So, we have ~16.6 milliseconds per frame. That is the time that the browser has to finish its job and render something on the screen. So, what I was doing is forcing the browser to calculate everything into a single frame. That is crazy, and the result is logical.

![Feeding the beast at 60fps](imgs/frames.jpg)

In order to fix that we have to give more time and distribute our recursive calls into different frames. In general, there are two ways to achieve this. The first one uses `setTimeout(fn, 0)`:

```js
var processed = 0;
(function parse(e) {
    if(e.nodeType !== 1 || e.nodeName == 'SCRIPT') return;
    processed++;
    console.log(e.nodeName.toLowerCase() + ' (' + processed + ')');
    // using e.getAttributes ...
    for(var i=0; i<e.childNodes.length; i++) {
        (function(index) {
            setTimeout(function() {
                parse(e.childNodes[index]);
            }, 0);
        })(i);
    }
})(document.querySelector('body'));
```

We again have a `parse` function, but every child is sent for parsing through a `setTimeout` call.

The other way of solving the problem is by using `requestAnimationFrame`. It is supported by the most browsers  today but if you need to place your code into IE9 and below you may need a polyfill. 

```js
var processed = 0;
(function parse(e) {
    if(e.nodeType !== 1 || e.nodeName == 'SCRIPT') return;
    processed++;
    console.log(e.nodeName.toLowerCase() + ' (' + processed + ')');
    // using e.getAttributes ...
    for(var i=0; i<e.childNodes.length; i++) {
        (function(index) {
            requestAnimationFrame(function() {
                parse(e.childNodes[index]);
            });
        })(i);
    }
})(document.querySelector('body'));
```

By using this technique, we give enough time to the browser to handle our code. It also gives us the ability to add a preloader of the process. Because we are executing logic asynchronously, we know where exactly we are and what we do.

Problem solved. Tons of DOM elements processed without freezing the browser. Let's see the next example. What happen when we have to process big chunks of data.

## Dealing with big data

We worked on a project that is three years old. One of the pages has an instant name filter. The client visits the page, and there is an input field. Once he starts typing the application shows only those records that match the entered string. Over the years, the client uses this feature, and now he complains that it is too slow. 

We started investigating and we found that the page was loading roughly 7MBs of JSON data. That is a lot actually. There was no API for that kind of filtering in the backend. We did not have access to the script that generates the JSON either. So, we have to solve the problem in the client side. Here is the code that we had in the beginning:

```js
loadData('/api/data', function(data) {
    var numOfUsers = data.length;
    var printUsers = function(filter) {
        var r = new RegExp(filter || '', 'i');
        list.innerHTML = '';
        for(var i=0; i<numOfUsers; i++) {
            if(r.test(data[i].name)) {
                list.innerHTML += '<li>' + (i+1) + '. ' + data[i].name + '</li>';
            }
        }
    }
    field.addEventListener('keyup', function() {
        printUsers(field.value);
    });
    printUsers();
});
```

`list` and `field` are DOM elements. The `data` variable is an array with all the 5000+ records coming from the database. `printUsers` is the function that we call on every new character typed in the input field.

The performance of this page was terrible. It takes 10 seconds and more for the initial rendering and even more if we start typing. However, there was something interesting. It was really slow only when the browser has to show many elements. It became faster and faster if there were fewer records for displaying. It is also interesting that we loop through all the items of the `data` array every time. It is not like having fewer data for processing. Then I decided to comment the line that changes the `innerHTML` property of the `list` object. The result is amazing. The same page was rendered in just ~120ms and the typing in the field did not freeze the browser. 

![Feeding the beast at 60fps](imgs/dom.jpg)

Then I realized what the real problem was. It was not in the fact that we loaded many data. The browser was like a beast that eats everything. It parsed 7MBs of JSON fast and was able to iterate through every single record in just a few milliseconds. The problem was in the code that changes the DOM tree hundred of times per second. Every time when we apply a new value to `innerHTML` property the browser has to recalculate the position of the elements. Moreover, again, we wanted everything into a single frame.

So, the solution was to construct the needed html and apply it once after the big loop ends. For example:

```js
var printUsers = function(filter) {
    var r = new RegExp(filter || '', 'i');
    var html = '';
    for(var i=0; i<numOfUsers; i++) {
        if(r.test(data[i].name)) {
            html += '<li>' + (i+1) + '. ' + data[i].name + '</li>';
        }
    }
    list.innerHTML = html;
}
```

## Smart animations

In the last section of this article, I want to share a small trick that I learned before a couple of months. We had a long list of links. Every link was nicely placed inside a `<li>` tag. We had to animate the items once the user mouse over them. Again, we have just a few records in the beginning, and we used the following CSS:

```css
li {
    font-size: 18px;
    ...
    transition: all 200ms;
}
li:hover {
    font-size: 30px;
}
```

We were pleased with the result. It worked smooth. However, we started getting more and more items in the list and very soon it became glitchy. In fact, it was normal that we got such performance issues. We changed the geometry of the DOM elements, so they had to be onto different position. It required more calculation from the browser.

We all know about `translatez(0)` trick. It should boost our animations, right? It triggers GPU acceleration, and our element is rendered in its own layer. This is all great, but it comes at its own price. It could drain the battery of every mobile device pretty fast. It should be used wisely.

![Feeding the beast at 60fps](imgs/animation.jpg)

The trick in our case was to animate the correct properties. I strongly recommend checking ["High Performance Animations"](http://www.html5rocks.com/en/tutorials/speed/high-performance-animations/) article. It tells us which properties are cheap for animating. So, all we had to do is to replicate the `font-size` animation:

```css
li:hover {
    transform: scale(1.2, 1.2) translate(27px, 0);
}
```

The scaling and a short translating by the X axis did the job. We had the same visual appearance but better performance.

## Summary

Believe it or not, I spent more time trying to crash my browser than writing this article. The examples in this article are inspired by real applications. The bad code that we had in the beginning produces slow applications, but they were still functional. The browsers nowadays are smart, effective and are trying to optimize whatever they can. All we have to do is to understand how they work and help them do their job.