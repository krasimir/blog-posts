* Remove bunch of boilerplate
* Allows us to extract logic and gives us more options for composition
* Your stateless components are not stateless anymore
* Kinda magical because you don't actually know where this state exists
* The hooks are indeed just JavaScript functions but you can't really test them without placing them in a React component

---------------------------

# React hooks: changing the mindset or maybe not

If you use [React](https://reactjs.org/) you probably know about the so called [hooks](https://reactjs.org/docs/hooks-intro.html). They were officially announced at this year's ReactConf by Sophie Alpert and Dan Abramov. Their presentation could be seen [here](https://www.youtube.com/watch?v=V-QO-KO90iQ&index=2&list=PLPxbbTqCLbGE5AihOSExAa4wUM-P42EIJ&t=0s). I same as many others got intrigued by this new feature. A little bit confused by if I like them or not. So this article pretty much sums up my thinkings around React hooks and aims to give a balanced opinion.

> Have in mind that the hooks just get released and they are (maybe) a subject of change. Still experimental feature React team suggests to check the official documentation at [https://reactjs.org/docs/hooks-intro.html](https://reactjs.org/docs/hooks-intro.html) and monitor the [RFC](https://github.com/reactjs/rfcs/pull/68).

## What are hooks

I'm not going to explain everything about this new feature because (as usually happens) the React team provided a pretty good [documentation](https://reactjs.org/docs/hooks-intro.html) on the topic. I will just drop here the two examples that are most interesting to me.

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

First of all, the hooks are meant to be used only in stateless components. They don't makes sense (and don't work) in React components defined as classes. In the example above `useState` is the hook. What it does is that it makes our `Counter` component stateful. Or in other words we have the same local-state capabilities that we have if we are using classes. `useState` accepts the initial value of our state and returns an array of two items. The first one is the current value and the second one is a function that we may use to change the value. Here is the place to say that the decision of returning an array and not an object is pretty good. That's because we can name stuff properly with no efforts. Imagine what will be if we have an object as a result of the hook:

```js
const { value: count, changeValue: setCount } = useState(initialValue);
```

The React components defined as functions lack of two things comparing to the ones defined as classes - managing local state and lifecycle methods. `useState` is addressing the first point. There is another hook called `useEffect` which is the de facto replacement of the lifecycle methods. Here is an example:

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

The function passed to`useEffect` is called after the render is committed to the screen. It is something like `componentDidMount`. The function that we return inside is called when the component is removed from the screen similarly to `componentWillUnmount`. And because all this is defined inside our function we have access to the props and state it is also covering what `componentDidUpdate` gave us.

There is also `useContext` hook which is in the same **Basic hooks** section but I will skip it for now.

## The obvious advantages

I think we will all agree that the idea is not bad. In fact if we use hooks we write less code and our code reads better. We write only functions and not classes. There is no `this` and bindings in the constructor. The React component is written in a declarative fashion with almost no branches and it becomes easier to follow. Consider the following class:

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

It is the equivalent of the same `Counter` function above. We have three methods so more or less we have to jump through all of them to fully understand what is going on. `this.onButtonClicked.bind(this)` seems weird but we have to do it because we can't leave `.bind` in the `render` method for performance reasons. Overall we have some sort of boilerplate that we have to deal with when writing React components using classes. Let's have a look again at the variant that uses a hook:

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
function CounterA() {
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

That's fine but now we have one more layer in our components tree and sooner or later we will end up with the *wrapper hell* situation. Also I like the function as children pattern a lot but it looks a little bit off. Passing an expression as a child is not the most natural thing. On the other hand using a simple JavaScript function feels pretty normal.

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

We can even go further 


https://medium.com/@dan_abramov/making-sense-of-react-hooks-fdbde8803889
https://www.youtube.com/watch?v=V-QO-KO90iQ&index=2&list=PLPxbbTqCLbGE5AihOSExAa4wUM-P42EIJ&t=0s

