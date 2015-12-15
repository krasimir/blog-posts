# Flux architecture in 750 bytes

I'm obsessed by making my code simpler. I didn't say *smaller* because having less code doesn't mean that is simple and easy to work with. I believe that big part of the problems in the software industry come from the unnecessary complexity. Complexity which is a result of our own abstractions. You know, we (the programmers) like to abstract. We like placing things in black boxes and hope that these boxes will work together.

[Flux](http://facebook.github.io/flux/) is an architectural design pattern for building user interfaces. It was introduced by Facebook at their [F8](https://youtu.be/nYkdrAPrdcw?t=568) conference. Since then, lots of companies adopted the idea and it seems like a good pattern for building front-end apps. Flux is very often used with [React](http://facebook.github.io/react/). Another library released by Facebook. I myself use React+Flux in my [daily job](http://trialreach.com/) and I could say that the simplicity is one of the main benefits there. Flux as a pattern is simple enough to get your head around and React's API is a small one.

## Flux architecture and its main characteristics

![Basic flux architecture](./fluxiny_basic_flux_architecture.jpg)

The main action in this pattern is the **dispatcher**. It acts as a hub for all the events in the system. It's job is to receive notifications that we call **actions** and bypass them to all the **stores**. The store decides if it is interested or not and reacts by changing its internal state. The change is passed to the **views** which are (in my case) React components. If we have to compare Flux to the well known MVC we may say that the store is similar to a model.

The actions are coming to the dispatcher either from the views or from other part of the system like services. For example a module that performs a HTTP request. When it receives the result it may fire an action saying that the request was successful and attach the received data.

A wrong data flow is one of the biggest pitfalls in flux. For example, we may have an access to the store in our views but we should never call store methods that mutate its internal state. This should only happen via actions. Or we may end up with a store that receives and action and dispatches another one.

*(More or less the explanation above is based on my reading of the Flux's documentation and my day-to-day experience with the pattern. Have in mind that you may see other interpretations. And you better do :))*

## My two cents

As every other popular concept Flux also has some [variations](https://medium.com/social-tables-tech/we-compared-13-top-flux-implementations-you-won-t-believe-who-came-out-on-top-1063db32fe73). I decided to give my two cents and write my own. One of the main goals was to be as simple as possible. That's how [Fluxiny](https://github.com/krasimir/fluxiny) was born. You may be surprised but I invested a good amount of time in naming the repository. Do you know how difficult is to come with a short library name which at the same time is not registered in NPM? *(For the record Fluxiny = Flux + tiny)*

In the next few sections we'll see how I created [Fluxiny](https://github.com/krasimir/fluxiny). Why is that small and how I ended up having the code as it is.

### The dispatcher

In most of the cases we need a single dispatcher. Because it acts as a glue for the rest of the system's parts it makes sense that we have only one. There are two things coming to the dispatcher - actions and stores. The actions are simply forwarded to the stores so we don't necessary have to keep them. The stores however should be tracked inside the dispatcher:

![the dispatcher](./fluxiny_the_dispatcher.jpg)

That's what I started with:

```
var Dispatcher = function () {
  return {
    _stores: [],
    register: function (store) {  
      this._stores.push({ store: store });
    },
    dispatch: function (action) {
      if (this._stores.length > 0) {
        this._stores.forEach(function (entry) {
          entry.store.update(action);
        });
      }
    }
  }
};
```

The first thing that we notice is that we *expect* to see an `update` method in the passed stores. It will be nice to throw an error if such method is missing. Here is a smaller helper that we may use in other cases like this one:

```
var _has = function (obj, prop, error) {
  if (!(prop in obj)) throw new Error(error);
  return true;
};
```

And the `register` method becomes:

```
register: function (store) {
  if (_has(store, 'update', 'Every store should implement an `update` method')) {
    this._stores.push({ store: store });
  }
}
```

These 20 lines of code may be enough right. I mean, we may register stores and send actions to them. Well, there is one thing that doesn't look good to me. The views should be somehow bound to the stores.

### 





