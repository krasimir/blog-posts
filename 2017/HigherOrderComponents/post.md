# The Rise of the Higher-Order Components

There are lots of things which I like in React. Mostly the fact that it teaches interesting [patterns](https://github.com/krasimir/react-in-patterns). One of my favorites one is [higher-order component](https://github.com/krasimir/react-in-patterns/tree/master/patterns/higher-order-components). In this article we'll do a couple of experiments and will see how powerful this approach could be.

## What is a Higher-Order component?

That term comes from a higher-order function which by definition is:

> A function which takes a function as an argument and/or returns a function.

In the context of React this is (in most of the cases) a function that accepts a React component and returns another one:

```
function createHOC(Component) {
  return class HOC extends React.Component {
    render() {
      return &lt;Component { ...this.props } { ...this.state } />;
    }
  }
}
```

There are couple of interesting characteristics of the higher-order component. If we bypass all the props (the `{ ...props }` bit) we are creating a wrapper which is invisible for the rest of the application. For the outside world that's the same component with the same props. And because we have this middle layer we are able to inject stuff or control the rendering with no touch of the original component.

## Trigger rendering

React is all about rendering right. We change the state of the app and somehow magically the library triggers re-rendering of the component tree. In this section we will talk about that magic which hints React about our state changes. Check out this example below where we have a single React component on the page:

```
// ------------------ html
&lt;div id="root">&lt;/div>
&lt;input type="text" value="React" />
&lt;button>Set name&lt;/button>

// ------------------ javascript
const $ = selector => document.querySelector(selector);
const App = ({ name }) => &lt;h1>Hello { name || 'world'}!&lt;/h1>;
render(&lt;App />, $('#root'));
```

By clicking on the button we want to send the value of the input field as a prop to our React component. Clearly there is no API for that. We can't say "re-render the component with these new props". Not many people realize but this is the very first problem that everyone faces. Some changes happen outside of the view layer and we need to propagate these changes to React. The thing is that this exact problem is solved usually by a framework that we use and we never think about implementing a solution for it. Like in [Facebook's flux](https://github.com/facebook/flux) or [react-redux](https://github.com/reactjs/react-redux). Under the hood there is always a HOC that gets subscribed to something and calls its `setState` method.

Let's manually implement the pattern. We will create a function called `connect` that will return a higher-order component representing our original `App`:

```
const connect = function(Component) {
  return class HOC extends React.Component {    
    render() {
      return &lt;Component { ...this.props } { ...this.state }/>;
    }
  };
};
const App = connect(
  ({ name }) => &lt;h1>Hello {name || 'world'}!&lt;/h1>
);
```

Same snippet as above. We just bypass same props and for the rest of the system our `App` component looks absolutely the same. Now, when we have that middle layer we may trigger renders by saying `setState` in the higher-order component.

```
const connect = function(Component, subscribe) {
  return class HOC extends React.Component {
    constructor(props) {
      super(props);

      const rerender = props => this.setState(props);
      subscribe(rerender);
    }
    render() {
      return &lt;Component { ...this.props } { ...this.state }/>;
    }
  };
};
```

That new version of `connect` accepts a `subscribe` function. We then give a callback which if fired updates the local state of the HOC with the given data. And here is the use case:

```
const App = connect(
  ({ name }) => &lt;h1>Hello {name || 'world'}!&lt;/h1>,
  rerender => {
    $('button').addEventListener('click', () => {
      rerender({ name: $('input[type="text"]').value });
    });
  }
);

render(&lt;App />, $('#root'));
```

The second argument of `connect` is a function that receives the `rerender` function. We simply call it whenever we need to rerender. In this case we want to update the `name` prop so we pass it as an argument.

This approach may look like an anti-pattern because we update the state of a component from the outside which is not really recommended in React ecosystem. However, that is I believe the cleanest way to say "my data is changed, please rerender". There are some variations which use [React context](https://facebook.github.io/react/docs/context.html) but in the core of the concept is the higher-order component.

## Injecting dependencies

Another common problem in React development is how to send something to a component which is deep nested in the tree. We can't pass our dependencies through all the levels because that will pollute our components with unnecessary knowledge. Imagine that we have the following component that needs a `name` and a `job` strings:

```
// Title.jsx
const Title = ({ name, job }) => &lt;h1>My name is { name } and I work as { job }.&lt;/h1>
export default Title;
```

`name` and `job` props need to come from two stores which are defined at the very top of our application.

```
const JobStore = {  getJob: () => 'developer' };
const UserStore = { getName: () => 'Foo Bar' };
```

For sure we can pass those objects down the `Title` component but this means that we have to mention `JobStore` and `UserStore` on a lot of places. What if we have a container (`DI.js`) that keeps such dependencies and gives us access to them when we need:

```
// DI.js
const storage = {};

export function register(key, dependency) {
  storage[key] = dependency;
}
export function get(key) {
  return storage[key];
}
```

And once we initialize our stores we just pass them to the container:

```
import { register } from './DI';

const JobStore = { getJob: () => 'developer' };
const UserStore = { getName: () => 'Foo Bar' };

register('JobStore', JobStore);
register('UserStore', UserStore);
```

At this point our `Title` component needs only the dependency container. By calling `get('JobStore')` for example we will access the store. However, wouldn't be better if we hide the whole idea about the container in a higher-order component and we have the following API:

```
const Title = wire(
  ({ name, job }) => &lt;h1>My name is { name } and I work as { job }.&lt;/h1>,
  ['JobStore', 'UserStore'],
  (job, user) => ({
    job: job.getJob(),
    name: user.getName()
  })
);
export default Title;
```

Where `wire` is a function that returns a HOC and accepts:

* Our original component
* An array of strings that represent our dependencies
* A function that receives the actual dependencies, pulls the data from them and returns a set of props

And here is the implementation. It's similar to the one used in the previous section:

```
import { get } from './DI';

const wire = function(Component, dependencies, mapDepsToProps) {
  return class HOC extends React.Component {
    constructor(props) {
      super(props);

      this.state = mapDepsToProps(...dependencies.map(get));
    }
    render() {
      return &lt;Component { ...this.props } { ...this.state }/>;
    }
  };
};
```

`dependencies.map(get)` is simply converting the array of dependency keys (strings) to an array of actual objects (our stores). And because it is an array we may use the spread operator to pass the items as arguments to `mapDepsToProps` function.

Of course the implementation here is naive and far from perfect. We just did the initial dependency injection. The `wire`d component needs to be re-rendered if some of the dependencies change but that is a whole other story. This could be solved by again using some sort of observer pattern where we listen for changes (or invalidate) in the dependencies.

## Conclusion

I'm using a lot of higher-order components in my daily job. I started playing with this pattern in [HOCBox repo](https://github.com/krasimir/hocbox) where I did more advanced versions of the above examples. There is also [signals](https://github.com/krasimir/hocbox#signals) implementation which is about exchanging messages between components. If you find this interesting I will be more then happy to see some other use cases where HOCs are the driving power.

Thanks for reading.