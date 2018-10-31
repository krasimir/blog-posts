# React hooks: changing the mindset or maybe not

If you use [React](https://reactjs.org/) you probably know about the so called [hooks](https://reactjs.org/docs/hooks-intro.html). They were officially announced at this year's ReactConf by Sophie Alpert and Dan Abramov. Their presentation could be seen [here](https://www.youtube.com/watch?v=V-QO-KO90iQ&index=2&list=PLPxbbTqCLbGE5AihOSExAa4wUM-P42EIJ&t=0s). I, same as many others got intrigued by this new feature. A little bit confused by if I like them or not but kind of excited. This article pretty much sums up my thinkings around React hooks and aims to give a balanced opinion.

> Have in mind that the hooks just got released and they are (maybe) a subject of change. Beign an experimental feature React team suggests to check the official documentation at [https://reactjs.org/docs/hooks-intro.html](https://reactjs.org/docs/hooks-intro.html) and monitor the [RFC](https://github.com/reactjs/rfcs/pull/68).

## What are hooks

I'm not going to explain everything because (as usually happens) the React team provided a pretty good [documentation](https://reactjs.org/docs/hooks-intro.html) on the topic. I will focus on two examples that are most interesting to me.

```js
import React, { useState } from 'react';

function Counter() {
  const initialValue = 0;
  const [ count, setCount ] = useState(initialValue);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

First of all, the hooks are meant to be used only in stateless components. They don't makes sense (and don't work) in React components defined as classes. In the example above `useState` is the hook. What it does is that it makes our `Counter` component stateful. Or in other words we have the same local-state capabilities that we have if we are using classes. `useState` accepts the initial value of our state and returns an array of two items. The first one is the current value and the second one is a function that we may use to change the value. The decision of returning an array and not an object is pretty good. That's because we can name stuff properly with no efforts. Imagine how will be if we have an object as a result of the hook:

```js
const { value: count, changeValue: setCount } = useState(initialValue);
```

A lot more verbose than it is supposed to be.

So far the React components defined as functions lack of two things comparing to the ones defined as classes - managing local state and lifecycle methods. `useState` is addressing the first point. There is another hook called `useEffect` which is the de facto replacement of the lifecycle methods. Here is an example:

```js
import React, { useEffect } from 'react';

function Example() {
  useEffect(() => {
    document.title = `The component is rendered`;
    return () => {
      document.title = `The component is removed from the DOM`;
    }
  });

  return <p>Hello world</p>;
}
```

The function passed to `useEffect` is called after the render is committed to the screen. It is something like `componentDidMount`. The function that we return inside is called when the component is removed from the screen similarly to `componentWillUnmount`. And because all this is defined inside our function we have access to the props and the state. Which effectively means that we can cover what `componentDidUpdate` is giving us.

There is also `useContext` hook which is in the same **Basic hooks** section but I will skip it for now.

## The obvious advantages

I think we will all agree that the idea is not bad. In fact if we use hooks we write less code and our code reads better. We write only functions and not classes. There is no usage of the keyword `this` and there is no weird bindings in the constructor. The React component is written in a declarative fashion with almost no branches and it becomes easier to follow. Consider the example below:

```js
class Counter extends React.Component {
  constructor(props) {
    super(props);

    this.state = { count: 0 };
    this.onButtonClicked = this.onButtonClicked.bind(this);
  }
  onButtonClicked() {
    this.setState({ count: this.state.count + 1 });
  }
  render() {
    const { count } = this.state;

    return (
      <div>
        <p>You clicked {count} times</p>
        <button onClick={this.onButtonClicked}>
          Click me
        </button>
      </div>
    );
  }
}
```

It is the equivalent of the same `Counter` function above. We have three methods so more or less we have to jump through all of them to fully understand what is going on. `this.onButtonClicked.bind(this)` seems weird but we have to do it because we can't leave `.bind` in the `render` method for performance reasons. Overall we have some sort of boilerplate that we have to deal with when writing React components using classes. Let's have a look again at the same `Counter` but written with hooks:

```js
function Counter() {
  const initialValue = 0;
  const [ count, setCount ] = useState(initialValue);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

Much simpler with less code we achieve the same thing. But more importantly for me are two things - the component becomes easier to read and the stateful logic becomes easier to share. Let's imagine that I want to use the same counter logic but with a different representation. If we decide to use classes we will probably go with the function as children pattern like so:

```js
class Counter extends React.Component {
  constructor(props) {
    super(props);

    this.state = { count: 0 };
    this.onButtonClicked = this.onButtonClicked.bind(this);
  }
  onButtonClicked() {
    this.setState({ count: this.state.count + 1 });
  }
  render() {
    const { count } = this.state;
    const { children } = this.props;

    return children({ count, increase: onButtonClicked });
  }
}
```

And then use the same `Counter` component many times:

```js
function AnotherCounter() {
  return (
    <Counter>
      {
        ({ count, increase }) => (
          <div>
            <p>You clicked {count} times</p>
            <button onClick={increase}>
              Click me
            </button>
          </div>
        )
      }
    </Counter>
  )
}
```

That's fine but now we have one more layer in our components tree and sooner or later we will end up with the *wrapper hell* situation. I do like the function as children pattern but it always looked a little bit off. Passing an expression as a child is not the most natural thing. On the other hand using a simple JavaScript function feels pretty normal.

```js
function useCounter(initialValue) {
  const [value, setCount] = useState(initialValue)

  return {
    value,
    increase: () => setCount(value + 1),
  }
}
export default function CounterA() {
  const counter = useCounter(0)

  return (
    <div>
      <p>You clicked {counter.value} times</p>
      <button onClick={counter.increase}>Click me</button>
    </div>
  )
}
```

With hooks it is possible to extract stateful logic to a simple JavaScript function which is just a composition of the basic hooks like `useState` and `useEffect`.

## Concerns

So far we saw how beneficial the hooks are. However, I'm a little bit reserved about this feature. The same way as I aws for the higher-order components and function as children patterns. I didn't quite like them but just a couple of days later I started using them all over my code. I bet it will be the same with the hooks. Till then I will question this approach of writing React and will try to make a fair judgement for myself.

The first thing which bothers me is changing the mindset for the functional React components. We used to think about them as dumb, short, stateless functions that only render stuff. Of course we can still have them like that but if the hooks became the new way of writing React we can't continue saying "If it is a function it has no state and it is purely rendering thing". Especially when using the `useEffect` hook where we pass a function and that function will probably do an async task. This means that the React component defined as a function is alive even it returns a result. For example:

```js
function FriendStatus(props) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(function onRender() {
    ChatAPI.subscribeToFriendStatus(
      props.friend.id,
      status => setIsOnline(status.isOnline)
    );
  });

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}
```

Notice how `useEffect` receives a function `onRender` which gets executed at some point in the future. We used to think that such React components are executed, they return something and that's it. And I think the confusing part is that `useEffect` handles logic which is not in sync with the rendering cycles of React. I mean it is not like we give data and that data is rendered. We trigger a process that happens in parallel with the rendering. Also we don't want to have our `onRender` fired every time when `FriendStatus` is rendered. There is an API to handle such cases - we may pass an array of variables as a second argument of `useEffect` which act as list of dependencies.

```js
useEffect(function componentDidMount() {
  ChatAPI.subscribeToFriendStatus(
    props.friend.id,
    status => setIsOnline(status.isOnline)
  );
}, [numberOfFriends]);
```

Let's say that in this example we subscribe to a friend's status and that subscription depends for some reason on the number of the friends. We can just pass that number as a second argument and React will skip the effect if it is the same during the next render. So, to wrap up my point here I will say that we have to change our mindset for the dumb components because they may be not so dumb anymore.

So far for me React was a no-magic library. I didn't dig into the code but there was no API which made me think "How did they do it?". When a saw `useState` for the first time that was the first question which pops up in my head. I kind of felt the same way when I saw the Angular 2 dependency injection. Even though Dan [explained](https://medium.com/@dan_abramov/making-sense-of-react-hooks-fdbde8803889#44b2) that there is no really magic behind this feature it feels magical from the outside. I'm not saying that this is a bad thing. It is just something which I didn't see in React before. There are certain [rules](https://reactjs.org/docs/hooks-rules.html) that we have to follow to have the hooks working properly. Like for example we have to define the hooks at the top of the function and avoid placing them in conditional or looping logic. Which I think is anyway going to happen and makes total sense. It is not like we don't have similar rules even now but this is a bit different.

## Conclusion

As I said in the beginning of the article, the hooks in React are experimental feature and they are still a proposal. You shouldn't rewrite your apps using hooks because their API may change. My thinking is that the hooks are a step in the right direction. However, they require some kind of a mindset shift in order to be adopted. That is because they are not just a pattern but a new paradigm that can significantly change how we build React apps. New ways of composition and new ways of share logic. 

## Resources

If you want to start using hooks and wondering where to start from I'll suggest first to watch [this presentation](https://www.youtube.com/watch?v=V-QO-KO90iQ&index=2&list=PLPxbbTqCLbGE5AihOSExAa4wUM-P42EIJ&t=0s) and then read the [official docs](https://reactjs.org/docs/hooks-intro.html). Once you try how everything works you will probably want to read [Making Sense of React Hooks](https://medium.com/@dan_abramov/making-sense-of-react-hooks-fdbde8803889) article and also check the Kent C. Dodds video tutorials [here](https://egghead.io/playlists/react-hooks-and-suspense-650307f2).

