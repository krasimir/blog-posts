# Debugging your front-end like is 2019

_(If you are lazy jump to [this](#todomvc-done-with-react-redux-and-redux-saga) section to learn what is this article all about.)_

Remember [The Island](https://en.wikipedia.org/wiki/The_Island_(2005_film%29) movie from 2005. I watched it again these days and I realized that there is something which really entertains me in the old sci-fi titles. It is funny how they create a world of flying vehicles and say something like _"The year is 2019 ..."_. Well, we are 2018 and the public transport is still on the ground. We still can't clone people (I hope so) or travel in a giant spaceship which looks like a fully-functional city.

![the island 2005](./theisland.png)

Then I started thinking about the people that create those movies. How cool and exciting is to think about the future and try to visualize it. This is what we are going to do in this article. We will try to create a tool that will be used by a generation of developers. A tool that these future people will find funny and incomplete.

## The script

Let's assume that is 2019 and we have a home robot. We give commands, the robot understands them and does what we want. Unfortunately is just 2019 not 3019 so our robot is kinda dumb and can do only two things - it can print stuff to the console or wait a promise to be resolved. The developers of the future also don't like making calculations manually. They use cloud computing. Let's say that we have a `compute` function that accepts two numbers, asks someone to make the calculation and returns the result. We will simulate the remote request by using a promise and `setTimeout` call.

```
const compute = (a, b) => new Promise(done => setTimeout(done, 2000, a + b));
```

Now, here are our commands in a form of a JavaScript generator.

```
function * commands() {
  yield 'Hey there!';
  yield 'Let me find the answer for you.';
  yield compute(10, 32);
  yield `I am done and the answer is ${ answer }.`;
}
```

The last actor in our script is the robot. It must be a function that iterates over our generator and executes the commands. In fact this is exactly the [command pattern implemented via generators](http://krasimirtsonev.com/blog/article/javascript-pattern-of-the-year-handle-async-like-a-boss).

```
var answer = null;
const robot = function (gen) {
  const step = gen.next();

  if (step.value) {
    if (typeof step.value === 'string') {
      console.log(step.value);
      if (!step.done) robot(gen);
    } else {
      step.value.then(result => {
        answer = result;
      });
      if (!step.done) robot(gen);
    }
  }
}
```

We use recursion to loop over the values produced by the generator. On every iteration we check if the value is a string. If yes then we print it out. If not we assume that it is a promise. Once that promise is resolved we assign the result to `answer` variable.

The script seems ready. It is available on [this](https://codepen.io/krasimir/pen/BJPBGM?editors=0010) codepen but unfortunately when we run it we are getting:

```
Hey there!
Let me find the answer for you.
I am done and the answer is null.
```

So, not exactly what we expected. It is time for debugging.

## Debugging

Nowadays the debugging of JavaScript is supported by amazing tools. The browsers come with built-in instruments showing detailed view about every function call. Let's take the Chrome's devtools for example and try to debug our little  application. We will place a `debugger` statement in the `robot` method which will stop the execution. We are effectively adding a break point.

const robot = function (gen) {
  const step = gen.next();
  debugger; // <------
  if (step.value) {
    if (typeof step.value === 'string') {
      console.log(step.value);
      if (!step.done) robot(gen);
    } else {
      step.value.then(result => {
        answer = result;
      });
      if (!step.done) robot(gen);
    }
  }
}

I added a few expressions to watch - `step.value`, `step.done` and `answer`. Here is the result:

![Redux devtools](./chrome_debugger.gif)

What we see is that the `answer` is always `null`. It never gets filled with a number. `step.value` seems correct though.

```
-- (1) ----------------------------------------
step.value -> 'Hey there!'
step.done -> false
answer -> null
-- (2) ----------------------------------------
step.value -> 'Let me find the answer for you.'
step.done -> false
answer -> null
-- (3) ----------------------------------------
step.value -> Promise
step.done -> false
answer -> null
-- (4) ----------------------------------------
step.value -> 'I am done and the answer is null.'
step.done -> false
answer -> null
-- (5) ----------------------------------------
step.value -> undefined
step.done -> true
answer -> null
```

What is also visible is the fact that there is no delay between `(3)` and `(4)`. That is also the key to our problem. We are not waiting the promise and resume the generator immediately.

```
...
} else {
  step.value.then(result => {
    answer = result;
  });
  if (!step.done) robot(gen);
}
```

should be 

```
...
} else {
  step.value.then(result => {
    answer = result;
    if (!step.done) robot(gen);
  });
}
```

Once this change is done we will see the expected result:

```
Hey there!
Let me find the answer for you.
I am done and the answer is 42.
```

That is pretty much how I solve issues daily. Very often instead of using the adding breakpoints and using the debugger I simply place `console.logs` here and there to see what is going on. Unfortunately, that is not always helpful. In this small example we saw a low level mistake where the bug was related to generator iteration. Those are easy to spot and fix. What gets difficult is logical mistakes where for example we update data in our store too early or set a wrong flag. In such cases we need a better debugging tool. A tool that provides contextual information about how our application works.

## A better debugging experience

I am doing programming for roughly [10 years](http://krasimirtsonev.com/#bio) and more or less I am following the same debugging patterns. There are questions which I ask myself and when I find the answers I am able to solve the bug.

* What exactly happened and in what order? - the answer of this question is list of events.
* How is my application state/data changed based on those events?

Answering on only one of these questions is not enough. The combination of them helps me visualize how the application worked. Otherwise the picture is not complete.

For the first time after so many years of writing code I saw a tool that kind of answers on my questions quickly without much effort from my side. That is the  [redux-devtools](https://github.com/gaearon/redux-devtools) browser extension.

![Redux devtools](./redux-devtools.png)

We have two panels. The left one answers on my first question showing what happened and in what order. The one on the right shows the application state corresponding to an event from the left side. We are also able to see details for the event and the diff that this event applied to the state. This is basically what I need to restore the user journey.

[redux-devtools](https://github.com/gaearon/redux-devtools) is awesome. It helped me work faster. The thing is that it is Redux related. Unfortunately we have bunch of other stuff going on. [At work](https://www.antidote.me/) we have several big progressive apps that use [redux-saga](https://redux-saga.js.org/) and very often I need to debug those bits too. Also developing a progressive app means that our code runs on the server and the initial render happen there. All the Redux actions and saga processes are happening there first and there is no way ([yet](https://github.com/zalmoxisus/redux-devtools-extension/issues/181)) to see them via the [redux-devtools](https://github.com/gaearon/redux-devtools).

So, I came with the idea that I may try creating a similar extension but collecting information from various sources. Not only Redux. That is how [Kuker](https://github.com/krasimir/kuker) was born. Supporting Redux and redux-saga was fun but then I realized that I may extend the idea and now the extension supports frameworks like [Angular](https://github.com/krasimir/kuker#integration-with-angular) and [Vue](https://github.com/krasimir/kuker#integration-with-vue).

## Meet [Kuker](https://github.com/krasimir/kuker)

My solution is simple and basically consist of two parts:

* A Chrome extension with two panels where the left one answers "What happened and in what order?" question while the one on the right talks about application state and how it mutates. What exactly is "state" depends on what events we send. For Redux this is the data in the store, for React it is the component tree, for the DOM is the HTML elements.
* A collection of short scripts that monitor the application and inform the extension. I call them [emitters](https://github.com/krasimir/kuker#emitters).

_(The Chrome extension may be installed from [here](https://chrome.google.com/webstore/detail/glgnienmpgmfpkigngkmieconbnkmlcn). The available emitters are listed [here](https://github.com/krasimir/kuker#emitters).)_

To demonstrate how everything works we will use the example above. We will write a custom emitter that will communicate with the extension.

## Writing a custom emitter

In order to send a message to Kuker's DevTools UI we have to do one thing - calling of `window.postMessage` function. It is a [standard API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).:

```
var step = 0;
const emit = function (state) {
  window.postMessage({
    kuker: true,
    type: `GENERATOR_STEP_${ ++step }`,
    state,
    icon: 'fa-hand-o-right',
    color: '#8cc8ea',
    time: (new Date()).getTime()
  }, '*');
}
```

Let's add this helper to [our broken codepen](https://codepen.io/krasimir/pen/BJPBGM?editors=0010). Inside the `robot` function we will call `emit` with the following parameters:

```
emit({
  value: String(step.value),
  done: step.done,
  answer
});
```

If [Kuker](https://chrome.google.com/webstore/detail/glgnienmpgmfpkigngkmieconbnkmlcn) is installed and we open it in the devtools panel we will see the following sequence of events:

![Kuker](./codepen1.gif)

Let's fix our bug and see the difference. We move the `if (!step.done) robot(gen);` inside the promise and [Kuker](https://chrome.google.com/webstore/detail/glgnienmpgmfpkigngkmieconbnkmlcn) now shows a slightly different picture:

![Kuker](./codepen2.gif)

`GENERATOR_STEP_4` event now has +2 seconds in time and the `answer` is set to `42`. We will mention this in the section below but also notice that that all the events except the first one has a small white rectangle on the right side. This indicates that they do modify the state. Which in our case consist of `value`, `step` and `answer`. The thing is that we know that those events come with changes in some of these variables. However, what we are interested in the most is the `answer` one. So why not watch that specifically:

![Kuker](./codepen3.gif)

That was fun but kinda trivial right. Let's explore a more complex scenario where we have some mature framework like React involved.

## TodoMVC done with React, Redux and redux-saga

I forked a [repository](https://github.com/philmein/todomvc-react-redux-saga) that implements [TodoMVC](http://todomvc.com/) using [React](https://reactjs.org/), [Redux](https://redux.js.org/) and [redux-saga](https://redux-saga.js.org/). It's a fairly complex app having couple of user journeys so I always like to use it as an example. The source code which is deployed [here](http://work.krasimirtsonev.com/git/redux-react-saga-todomvc) is available at [github.com/krasimir/todomvc-react-redux-saga](https://github.com/krasimir/todomvc-react-redux-saga) and you can browse it to see the integration of Kuker's emitters. They are three:

* [React emitter](https://github.com/krasimir/kuker#integration-with-react) - [here](https://github.com/krasimir/todomvc-react-redux-saga/blob/master/src/app.js)
* [Redux emitter](https://github.com/krasimir/kuker#integration-with-redux) - [here](https://github.com/krasimir/todomvc-react-redux-saga/blob/master/src/config/store.js)
* [redux-saga emitter](https://github.com/krasimir/kuker#integration-with-redux-saga) - [here](https://github.com/krasimir/todomvc-react-redux-saga/blob/master/src/config/business-logic.js)

You may install the extension from the [Chrome's web store](https://chrome.google.com/webstore/detail/glgnienmpgmfpkigngkmieconbnkmlcn) and open [this url](http://work.krasimirtsonev.com/git/redux-react-saga-todomvc). Start using the app and in the DevTools tab of Kuker you will see a picture like this:

![TodoMVC](./todomvc1.png)

In here we see events coming from all the three emitters. The rows that start with a number like `#67` are saga effects. That is actually the id of the saga. Next to that number, on the right side there is another one which is showing the id of the parent saga. We do see two Redux actions `CREATE_NEW_TODO` and `TODOS/INSERT`. At the end of the screenshot are listed React `Update` event and a mounting of one new component.

Let's play with the extension and see what can offer to us.

### Filtering

There is a small gear at the top of the left panel. It brings a list of all the event types dispatched to the extension and we are able to filter out the once that are not relevant to us. For example, if we want to see only the Redux onces:

![TodoMVC](./kuker_filtering.png)

Also notice that together with the event types we may filter the sources. Usually we have only one but if we server-side render this app we will get node as a source too. The Kuker emitters check if they run in browser environment and if not they assume that it is node. Then a socket server is started which the Kuker extension is connecting to. That is how we see events from SSR phase of our application.

### Adding a marker and clearing events

At the same bar where the gear for filtering is we have two other buttons. Adding a marker and clearing the events. The marker is useful when you have lots of event coming and you want to see which are the new ones. For example we reach the point of the app and we know that after doing a certain action we will get bunch of events which will give us the information that we need. In this case we just add a marker and we know that the events after that red line are what we need.

![TodoMVC](./kuker_marker.png)

### Monitoring the state

In the right panel by default we see the current state of the application. It shows what was the state at the time when the event is dispatched. Once we have two or more events we are able to calculate a diff between them. It appears below the state tree in a dedicated section showing the path of the changed property, the old and the new value. Additions and deletions are also captured.

![TodoMVC](./kuker_state.png)

That is cool and we have it in redux-devtools. What I was missing in there is a marker that shows me which of the events are mutating state. Imagine that you have 50+ events to examine for a specific state change. We have to play them one by one to find out which amended the data. In Kuker we have a marker to support this case. It is a small white rectangle that appears on the right side of the event. Events having this marker mutated the state. However, this is not completely solving our issue because what if they all apply some data transformations. If we look closely to the state tree items we will see that every property has an eye icon next to it. By clicking it we are saying "I am interested in this bit of the state. Show me who is changing it.". Here is an example demonstrating both markers:

![TodoMVC](./kuker_state_markers.png)

As we mentioned above, "state" for the different [emitters](https://github.com/krasimir/kuker#emitters) mean different thing. In the following screenshot we see how the currently selected event is produced by the [React emitter](https://github.com/krasimir/kuker#integration-with-react) and the right panel shows the React components which are on the page. Same as the case above, we are able to click the eye icon and see which of the events affected that part of the component tree. When displaying a HTML-like state we have additional information for every of the nodes. It appears below the tree. Like in this example we see the props of the `<App>` component.

![TodoMVC](./kuker_state_html.png)

Kuker uses the same approach when displaying events coming from the [Vue](https://github.com/krasimir/kuker#integration-with-vue), [Angular](https://github.com/krasimir/kuker#integration-with-angular) and [HTML](https://github.com/krasimir/kuker#html-emitter) emitters.

### Detail view of an event

Next to the "State" tab in the right panel we have "Event". The tree that we see there displays some details about the event and the actual data send from the page.

![TodoMVC](./kuker_event.png)

## Final words

Debugging is an important part of every developer's life. It takes a big chunk of our time and it should be a flawless experience. I strongly believe that the tools that we use while debugging should be context specific. What I mean by that is that they should display information about process and not about implementation. The source panel of Chrome's devtools for example is awesome to track what exactly happened in the JavaScript world but sometimes is way more noisy then redux-devtools. And that is fine because it targets the low level JavaScript execution while redux-devtools is targeting Redux flow. What I'm aiming by creating [Kuker](https://github.com/krasimir/kuker) is to provide a context specific debugging experience.

## Call for contributors

Please, if you are an author of a framework or library and you want to see it supported by Kuker do submit an issue in the [Kuker's repository](https://github.com/krasimir/kuker). I'll be more then happy to integrate it. What Kuker support so far is: 

* [React](https://github.com/krasimir/kuker#integration-with-react)
* [Angular](https://github.com/krasimir/kuker#integration-with-angular)
* [Vue and Vuex](https://github.com/krasimir/kuker#integration-with-vue)
* [Redux](https://github.com/krasimir/kuker#integration-with-redux)
* [redux-saga](https://github.com/krasimir/kuker#integration-with-redux-saga)
* [HTML](https://github.com/krasimir/kuker#html-emitter)
* [Stent](https://github.com/krasimir/kuker#integration-with-stent)
* [Machina.js](https://github.com/krasimir/kuker#integration-with-machinajs)
* [MobX](https://github.com/krasimir/kuker#integration-with-mobx)
* [Base emitter](https://github.com/krasimir/kuker#baseemitter)

## Links

* [Kuker in Chrome's web store](https://chrome.google.com/webstore/detail/glgnienmpgmfpkigngkmieconbnkmlcn)
* [Official documentation](https://github.com/krasimir/kuker)



