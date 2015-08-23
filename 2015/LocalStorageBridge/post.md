# Using Local Storage as a communication channel

So its been a few months since I published something here. It's not because I'm lazy (that's true though) but because I was working on my [second book](https://www.packtpub.com/application-development/nodejs-example). Now the book is almost finished and I'll start actively blogging again. In this article we'll see how to use the [local storage](http://diveintohtml5.info/storage.html) of the browser as a communication channel.

## The problem

What is this all about? I'm working on a single page application that may be placed inside an iFrame. If you ever did that you probably know that working in such scenario is not the easiest thing on the planet. For example, we see the HTTP requests in the browser's console but we can't log anything. An application in iFrame is like a [blackbox](https://hacks.mozilla.org/2014/08/black-box-driven-development-in-javascript/). You know that something is happening there but can't see the details.

For a short period of time I was thinking about things like reading location hash value or attaching methods to the iFrame's window object. Then I remembered about [**earhorn**](https://github.com/omphalos/earhorn) library. It's a piece of code that logs JavaScript executions. Really helpful but I'm not going into that now. It's interesting how this tool produces its output. Shortly:
* We pass our source to **earhorn** and we get the same code but instrumented.
* In a new tab of the browser we load a page provided by the library.
* Then, with the same browser, we open our application containing the instrumented code and start using the app.
* If we go to the newly opened tab we'll see that our actions are logged.

How is this possible? Our application is not making HTTP request and it's not wired to a [socket server](http://krasimirtsonev.com/blog/article/Real-time-chat-with-NodeJS-Socketio-and-ExpressJS). It looks like the two tabs are communicating somehow.

## The solution 

**earhorn** uses the local storage of the browser to store and retrieve messages between the tabs. That is possible because we run the two pages inside one browser and they both read from the same place. So in theory:

```
page 1 (our app) | page 2 (earhorn)
-----------------------------------
> writes to      | . checking localStorage
  localStorage   | . checking localStorage
                 | > reads from
                 |   localStorage
                 | > clears
                 |   localStorage
> writes to      | . checking localStorage
  localStorage   | . checking localStorage
                 | ... and so on
```

The code in our application stores something in the local storage. The second page constantly checks if there is a value. If yes, fetch it and clears the storage so it doesn't get the same value twice.

## The implementation

Well, it's not that simple as it looks like. I spent half a day fine-tuning the process.

Here is the API provided by the browser:

* `localStorage.setItem(<keyword>, <value>)` - storing a key-value pair
* `localStorage.getItem(<keyword>)` - fetching a value stored under `<keyword>`
* `localStorage.removeItem(<keyword>)`

The very first job to do is saving something in the storage. Sadly, the `<value>` from the list above could be only a string (or number). I'd probably use object literals so the following function came to my mind:

```
api.send = function(namespace, data) {
  var raw = '';
  if(typeof data === 'function') { data = data(); }
  if(typeof data === 'object') {
    raw = JSON.stringify(data);
  } else {
    raw = data;
  }
  localStorage.setItem(namespace, raw);
};
```

I leaved an option for passing function. If that's the case then we expect that the function returns the value.

So, the saving is done. Now we have to listen (or subscribe) for changes in the storage so we fetch the data.

```
var listeners = {};
api.subscribe = function(namespace, cb) {
  if(!listeners[namespace]) {
    listeners[namespace] = [];
    buffer[namespace] = [];
  }
  listeners[namespace].push(cb);
  if(!isLoopStarted) {
    isLoopStarted = loop();
  }
};
```
We may have different namespaces and subscribe to same namespace multiple times so I decided to introduce a helper variable `listeners`. It stores all callbacks into sections so if a particular value changes we loop through the items in the array and run the functions.

`isLoopStarted` acts as a flag so we don't run the `loop` method several times.

The browsers provide a `storage` event which is dispatched when something is updated. I thought using it but apparently it's not fired properly in every browser. So I ended up with the good old `setTimeout` calls (the `loop` function below) in 100 milliseconds interval. 

The next snippet demonstrates the hacky time interval where we are constantly checking for new value in the storage. If there is such we try parsing it and at the end fire all the callbacks. There is also a `buffer` array that keeps the already fetched messages. We use it to prevent reading the same value twice.

```
var loop = function() {
  for(var namespace in listeners) {
    var data = localStorage.getItem(namespace);
    if(data && buffer[namespace] && buffer[namespace].indexOf(data) === -1) {
      buffer[namespace].push(data);
      try {
        var parsed = JSON.parse(data);
        if(parsed) data = parsed;
      } catch(e) {}
      for(var i=0; i<listeners[namespace].length; i++) {
        listeners[namespace][i](data);
      }
    }
  }
  setTimeout(loop, interval);
  return true;
};
```

There is one problem with the code above. We are not removing the message from the local storage. If we run the function as it is our callbacks will be called multiple times. Sure, we can execute `localStorage.removeItem` just after the `for` loop. But that works if we have one client subscribing to those changes.

While I was testing I created a simple page where I stored and retrived values. And because that page contains the two operations I was only able to receive the messages there. No information was read by the other tab in the browser. It looks like I have to leave the data in the storage till all the tabs fetched it. The very first solution that I thought was storing a giant JSON object keeping the state of everyting - the clients, the messages and who actually read them. But that's too complex for such small tool. I was afraid that I'll end up with a chat server.

Fifteen minutes later the following code solved the problem:

```
if(!localStorage.getItem(namespace + '-removeit')) {
  localStorage.setItem(namespace + '-removeit', '1');
  setTimeout(function() {
    localStorage.removeItem(namespace);
    localStorage.removeItem(namespace + '-removeit');
    buffer[namespace] = [];
  }, intervalForRemoval);
}
```

I placed it just after the `for` loop. The first client tha reads the value stores another key-value pair - `something-removeit: 1`. After that no one of the other tabs goes into the same thing because of the `if` clause. Even the page that created that record. After that we simply wait till all the clients read the message. And how we know that they actually read it. Well, we run the `loop` method every 100 milliseconds. So if we place the removal into another `setTimeout` with 500 milliseconds delay we "may" say that the subscribers read the value on time. Not ideal but it works.

Here is the final version of the `loop` functions:

```
var loop = function() {
  for(var namespace in listeners) {
    var data = localStorage.getItem(namespace);
    if(data && buffer[namespace] && buffer[namespace].indexOf(data) === -1) {
      buffer[namespace].push(data);
      try {
        var parsed = JSON.parse(data);
        if(parsed) data = parsed;
      } catch(e) {}
      for(var i=0; i<listeners[namespace].length; i++) {
        listeners[namespace][i](data);
      }
      if(!localStorage.getItem(namespace + '-removeit')) {
        localStorage.setItem(namespace + '-removeit', '1');
        (function(n) {
          setTimeout(function() {
            localStorage.removeItem(n);
            localStorage.removeItem(n + '-removeit');
            buffer[namespace] = [];
          }, intervalForRemoval);
        })(namespace);
      }
    } else if(!data) {
      buffer[namespace] = [];
    }
  }
  setTimeout(loop, interval);
  return true;
};
```

## The library

And because that's not just a single function I decided to wrap the whole thing into a library called [lsbridge](https://github.com/krasimir/lsbridge). Of course the whole tricky logic is masked into a friendly API:

```
// sending a message
lsbridge.send('my-namespace', { message: 'Hello world!' });

// listening
lsbridge.subscribe('my-namespace', function(data) {
  console.log(data); // prints: { message: 'Hello world!'}
});
```

The following animated GIF demonstrates the final result:

![lsbridge](http://work.krasimirtsonev.com/git/lsbridge/lsbridge.gif)

Source: [https://github.com/krasimir/lsbridge](https://github.com/krasimir/lsbridge)

P.S.
*Only scripts that are published on same host and port may read the same localStorage resource.*


