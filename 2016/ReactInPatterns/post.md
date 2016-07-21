Long time I was searching for a good front-end framework. Framework that will help me write scalable and easy to maintain UI. Even though React is just a library for rendering it comes with so many benefits that I can easily say "I found it". And like every thing that I use a lot I started seeing some patterns. Techniques that are applied over and over again and I see in the code of other developers. It's time that I start documenting, discussing and sharing these patterns.

All the techniques described here are available in [github.com/krasimir/react-in-patterns](https://github.com/krasimir/react-in-patterns) repository. I'll probably not update this blog post but will continue publishing stuff in GitHub. I'll also encourage you to comment below, [file an issue](https://github.com/krasimir/react-in-patterns/issues) or directly make a [pull request](https://github.com/krasimir/react-in-patterns/pulls) with patterns that you recognize.

## Communication

Building with React for a couple of months and you'll realize that every React component is like a small system that operates on its own. It has its own state, input and output.

### Input

The input for a React component is its props. That's how we pass data to it:

```js
// Title.jsx
class Title extends React.Component {
  render() {
    return <h1>{ this.props.text }</h1>;
  }
};
Title.propTypes = {
  text: React.PropTypes.string
};
Title.defaultProps = {
  text: 'Hello world'
};

// App.jsx
class App extends React.Component {
  render() {
    return <Title text='Hello React' />;
  }
};
```

The `Title` component has only one input - `text`. The parent component (`App`) should provide it as an attribute while using the `<Title>` tag. There are two additional settings that we see above:

* `propTypes` - defines the type of the props. This helps React telling us when a provided prop is not what we expect.
* `defaultProps` - defines the default values of the props. We may require the existence of certain props but for the rest is good practice to set a default value.

There is also `props.children` property that gives us an access to the child components passed by the owner of the component. For example:

```js
class Title extends React.Component {
  render() {
    return (
      <h1>
        { this.props.text }
        { this.props.children }
      </h1>
    );
  }
};

class App extends React.Component {
  render() {
    return (
      <Title text='Hello React'>
        <span>community</span>
      </Title>
    );
  }
};
```

*Notice that if we don't return `{ this.props.children }` as part of the `Title`'s render method the `<span>` tag will not be rendered.*

An indirect input to a component may be also the so called `context`. The whole React tree may have a `context` object which is accessible by every component. More about that in the [dependency injection](https://github.com/krasimir/react-in-patterns/tree/master/patterns/dependency-injection) section.

### Output

The obvious output is the rendered HTML. Visually that's what we get from a React component. Of course some of the components contain logic that probably sends out transformed data or triggers an action/event in our system. To achieve that we again use component's props:

```js
class Title extends React.Component {
  render() {
    return (
      <h1>
        <a onClick={ this.props.logoClicked }>
          <img src='path/to/logo.png' />
        </a>
      </h1>
    );
  }
};

class App extends React.Component {
  render() {
    return <Title logoClicked={ this.logoClicked } />;
  }
  logoClicked() {
    console.log('logo clicked');
  }
};
```

We pass a callback which is invoked from within the component. The `logoClicked` function above may accept data which is how we transfer information back from the child to parent component.

We should mention that there is no API that allow us accessing child's state. Or in other words we can't use `this.props.children[0].state` or something like that. The proper way of retrieving information from the children is by using props (passing callbacks). And that's a good thing. This approach forces us defining clear APIs and encourage the [one-way direction data flow](https://github.com/krasimir/react-in-patterns/tree/master/patterns/one-direction-data-flow).

## Composition

> [Source code](https://github.com/krasimir/react-in-patterns/tree/master/patterns/composition/src)

One of the biggest benefits of [React](http://krasimirtsonev.com/blog/article/The-bare-minimum-to-work-with-React) is composability. I personally don't know a framework that offers such an easy way to create and combine components. In this section we will explore few composition techniques which proved to work well.

Let's get a simple example. Let's say that we have an application with a header and we want to place a navigation inside. We have three React components - `App`, `Header` and `Navigation`. They have to be nested into each other so we end up with the following markup:

```js
<App>
  <Header>
    <Navigation> ... </Navigation>
  </Header>
</App>
```

The trivial approach for combining these components is to reference them in the places where we need them.

```js
// app.jsx
import Header from './Header.jsx';

export default class App extends React.Component {
  render() {
    return <Header />;
  }
}

// Header.jsx
import Navigation from './Navigation.jsx';

export default class Header extends React.Component {
  render() {
    return <header><Navigation /></header>;
  }
}

// Navigation.jsx
export default class Navigation extends React.Component {
  render() {
    return (<nav> ... </nav>);
  }
}
```

However, following this pattern we introduce several problems:

* We may consider the `App` as a place where we wire stuff, as an entry point. So, it's a good place for such composition. The `Header` though may have other elements like a logo, search field or a slogan. It will be nice if they are passed somehow from the outside so we don't create a hard-coded dependency. What if we need the same `Header` component but without the `Navigation`. We can't easily achieve that because we have the two bound tightly together.
* It's difficult to test. We may have some business logic in the `Header` and in order to test it we have to create an instance of the component. However, because it imports other components we will probably create instances of those components too and it becomes heavy for testing. We may break our `Header` test by doing something wrong in the `Navigation` component which is totally misleading. *(Note: while testing the [shallow rendering](https://facebook.github.io/react/docs/test-utils.html#shallow-rendering) solves this problem by rendering only the `Header` without its nested children.)*

### Using React's children API

In React we have the handy [`this.props.children`](https://facebook.github.io/react/docs/multiple-components.html#children). That's how the parent reads/accesses its children. This API will make our Header agnostic and dependency-free:

```js
// App.jsx
export default class App extends React.Component {
  render() {
    return (
      <Header>
        <Navigation />
      </Header>
    );
  }
}

// Header.jsx
export default class Header extends React.Component {
  render() {
    return <header>{ this.props.children }</header>;
  }
};
```

It's also easy to test because we may render the `Header` with an empty `<div>`. This will isolate the component and will let us focus on only one piece of our application.

### Passing a child as a property

Every React component receive props. It's nice that these props may contain all kind of data. Even other components.

```js
// App.jsx
class App extends React.Component {
  render() {
    var title = <h1>Hello there!</h1>;

    return (
      <Header title={ title }>
        <Navigation />
      </Header>
    );
  }
};

// Header.jsx
export default class Header extends React.Component {
  render() {
    return (
      <header>
        { this.props.title }
        <hr />
        { this.props.children }
      </header>
    );
  }
};

```

This technique is helpful when we have a mix between components that exist inside the `Header` and components that have to be provided from the outside.


## Higher-order components

> [Source code](https://github.com/krasimir/react-in-patterns/tree/master/patterns/higher-order-components/src)

Higher-order components look really similar to the [decorator design pattern](http://robdodson.me/javascript-design-patterns-decorator/). It is wrapping a component and attaching some new functionalities or props to it.

Here is a function that returns a higher-order component:

```js
var enhanceComponent = (Component) =>
  class Enhance extends React.Component {
    render() {
      return (
        <Component
          {...this.state}
          {...this.props}
        />
      )
    }
  };

export default enhanceComponent;
```

Very often we expose a factory function that accepts our original component and when called returns the enhanced/wrapped version of it. For example:

```js
var OriginalComponent = () => <p>Hello world.</p>;

class App extends React.Component {
  render() {
    return React.createElement(enhanceComponent(OriginalComponent));
  }
};
```

The very first thing that the higher-order component does is to render the original component. It's also a good practice to pass the `state` and `props` to it. This is helpful when we want to proxy data and use the higher-order component as it is our original component.

The higher-order component gives us control on the input. The data that we want to send as props. Let's say that we have a configuration setting that `OriginalComponent` needs:

```js
var config = require('path/to/configuration');

var enhanceComponent = (Component) =>
  class Enhance extends React.Component {
    render() {
      return (
        <Component
          {...this.state}
          {...this.props}
          title={ config.appTitle }
        />
      )
    }
  };
```

The knowledge for the configuration is hidden into the higher-order component. `OriginalComponent` knows only that it receives a `prop` called `title`. Where it comes from it is not important. That's a huge advantage because it helps us testing the component in an isolation and provides nice mechanism for mocking. Here is how the `title` may be used:

```
var OriginalComponent  = (props) => <p>{ props.title }</p>;
```

Higher-order components are involved into another useful pattern - [dependency injection](https://github.com/krasimir/react-in-patterns/tree/master/patterns/dependency-injection).

## Dependency injection

> [Source code](https://github.com/krasimir/react-in-patterns/tree/master/patterns/dependency-injection/src)

Big part of the modules/components that we write have dependencies. A proper management of these dependencies is critical for the success of the project. There is a technique (some people consider it as a *pattern*) called [*dependency injection*](http://krasimirtsonev.com/blog/article/Dependency-injection-in-JavaScript) that helps solving the problem.

In React the need of dependency injector is easily visible. Let's consider the following application tree:

```js
// Title.jsx
export default function Title(props) {
  return <h1>{ props.title }</h1>;
}

// Header.jsx
import Title from './Title.jsx';
export default function Header() {
  return (
    <header>
      <Title />
    </header>
  );
}

// App.jsx
import Header from './Header.jsx';
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { title: 'React in patterns' };
  }
  render() {
    return <Header />;
  }
};
```

The string "React in patterns" should somehow reach the `Title` component. The direct way of doing this is to pass it from `App` to `Header` and then `Header` to pass it to `Title`. However, this may work for these three components but what happens if there are multiple properties and deeper nesting. Lots of components will have to mention properties that they are not interested in.

We already saw how the [higher-order component](https://github.com/krasimir/react-in-patterns/tree/master/patterns/higher-order-components) may be used to inject data. Let's use the same technique to inject the `title` variable:

```js
// enhance.jsx
var title = 'React in patterns';
var enhanceComponent = (Component) =>
  class Enhance extends React.Component {
    render() {
      return (
        <Component
          {...this.state}
          {...this.props}
          title={ title }
        />
      )
    }
  };

// Header.jsx
import enhance from './enhance.jsx';
import Title from './Title.jsx';

var EnhancedTitle = enhance(Title);
export default function Header() {
  return (
    <header>
      <EnhancedTitle />
    </header>
  );
}
```

The `title` is hidden in a middle layer (higher-order component) where we pass it as a prop to the original `Title` component. That's all nice but it solves only half of the problem. Now we don't have to pass the `title` down the tree but how this data will reach the `enhance.jsx` helper.

React has the concept of [*context*](https://facebook.github.io/react/docs/context.html). The *context* is something that every component may have access to. It's something like an [event bus](https://github.com/krasimir/EventBus) but for data. A single model which we can access from everywhere.

```js
// a place where we'll define the context
var context = { title: 'React in patterns' };
class App extends React.Component {
  getChildContext() {
    return context;
  }
  ...
};
App.childContextTypes = {
  title: React.PropTypes.string
};

// a place where we need data
class Inject extends React.Component {
  render() {
    var title = this.context.title;
    ...
  }
}
Inject.contextTypes = {
  title: React.PropTypes.string
};
```

Notice that we have to specify the exact signature of the context object. With `childContextTypes` and `contextTypes`. If those are not specified then the `context` object will be empty. That may be a little bit frustrating because we may have lots of stuff to put there. That's why it is a good practice that our `context` is not just a plain object but it has an interface that allows us to store and retrieve data. For example:

```js
// dependencies.js
export default {
  data: {},
  get(key) {
    return this.data[key];
  },
  register(key, value) {
    this.data[key] = value;
  }
}
```
Then, if we go back to our example, the very top `App` component may look like that:

```js
import dependencies from './dependencies';

dependencies.register('title', 'React in patterns');

class App extends React.Component {
  getChildContext() {
    return dependencies;
  }
  render() {
    return <Header />;
  }
};
App.childContextTypes = {
  data: React.PropTypes.object,
  get: React.PropTypes.func,
  register: React.PropTypes.func
};
```

And our `Title` component gets it's data through the context:

```js
// Title.jsx
export default class Title extends React.Component {
  render() {
    return <h1>{ this.context.get('title') }</h1>
  }
}
Title.contextTypes = {
  data: React.PropTypes.object,
  get: React.PropTypes.func,
  register: React.PropTypes.func
};
```

Ideally we don't want to specify the `contextTypes` every time when we need an access to the context. This detail may be wrapped in a higher-order component. And even more, we may write an utility function that is more descriptive and helps us declare the exact wiring. I.e instead of accessing the context directly with `this.context.get('title')` we ask the higher-order component to get what we need and to pass it as a prop to our component. For example:

```js
// Title.jsx
import wire from './wire';

function Title(props) {
  return <h1>{ props.title }</h1>;
}

export default wire(Title, ['title'], function resolve(title) {
  return { title };
});
```

The `wire` function accepts first a React component, then an array with all the needed dependencies (which are `register`ed already) and then a function which I like to call `mapper`. It receives what's stored in the context as a raw data and returns an object which is the actual React props for our component (`Title`). In this example we just pass what we get - a `title` string variable. However, in a real app this could be a collection of data stores, configuration or something else. So, it's nice that we pass exactly what we need and don't pollute the components with data that they don't need.

Here is how the `wire` function looks like:

```js
export default function wire(Component, dependencies, mapper) {
  class Inject extends React.Component {
    render() {
      var resolved = dependencies.map(this.context.get.bind(this.context));
      var props = mapper(...resolved);

      return React.createElement(Component, props);
    }
  }
  Inject.contextTypes = {
    data: React.PropTypes.object,
    get: React.PropTypes.func,
    register: React.PropTypes.func
  };
  return Inject;
};
```

`Inject` is a higher-order component that gets access to the context and retrieves all the items listed under `dependencies` array. The `mapper` is a function receiving the `context` data and transforms it to props for our component.

### Final thoughts about dependency injection

Most of the solutions for dependency injection in React components are based on context. I think that it's good to know what happens under the hood. As the time of this writing one of the most popular ways for building React apps involves [Redux](https://github.com/reactjs/react-redux). The *famous* `connect` function and the `Provider` there use the `context`.

I personally found this technique really useful. It successfully fullfills my dependencies needs and makes my components pure and highly testable.

## One-way direction data flow

> [Source code](https://github.com/krasimir/react-in-patterns/tree/master/patterns/one-direction-data-flow/src)

One-way direction data flow is a pattern that works nicely with React. It is around the idea that the components do not modify the data that they receive. They only listen for changes in this data and maybe provide the new value but they do not update the actual data store. This update happens following another mechanism in another place and the component just gets rendered with the new value.

Let's for example get a simple `Switcher` component that contains a button. We click it to enable a flag in the system.

```js
class Switcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = { flag: false };
    this._onButtonClick = e => this.setState({ flag: !this.state.flag });
  }
  render() {
    return (
      <button onClick={ this._onButtonClick }>
        { this.state.flag ? 'lights on' : 'lights off' }
      </button>
    );
  }
};

// ... and we render it
class App extends React.Component {
  render() {
    return <Switcher />;
  }
};
```

At this moment we have the data inside our component. Or in other words, `Switcher` is the only one place that knows about our `flag`. Let's send it out to some kind of a store:

```js
var Store = {
  _flag: false,
  set: function(value) {
    this._flag = value;
  },
  get: function() {
    return this._flag;
  }
};

class Switcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = { flag: false };
    this._onButtonClick = e => {
      this.setState({ flag: !this.state.flag }, () => {
        this.props.onChange(this.state.flag);
      });
    }
  }
  render() {
    return (
      <button onClick={ this._onButtonClick }>
        { this.state.flag ? 'lights on' : 'lights off' }
      </button>
    );
  }
};

class App extends React.Component {
  render() {
    return <Switcher onChange={ Store.set.bind(Store) } />;
  }
};
```

Our `Store` object is a simple [singleton](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#singletonpatternjavascript) where we have helpers for setting and getting the value of the `_flag` property. By passing the getter to the component we are able to update the data externally. More or less our application workflow looks like that:

```
User's input
     |
  Switcher -------> Store
```

Let's assume that we are saving the flag value to a backend service via the `Store`. When the user comes back we have to set a proper initial state. If the user left the flag truthy we have to show *"lights on"* and not the default *"lights off"*. Now it gets tricky because we have the data knowledge in two places. The UI and the `Store` have their own states. We have to communicate in both directions `Store ---> Switcher` and `Switcher ---> Store`.

```js
// ... in App component
<Switcher
  value={ Store.get() }
  onChange={ Store.set.bind(Store) } />

// ... in Switcher component
constructor(props) {
  super(props);
  this.state = { flag: this.props.value };
  ...
```

Our schema changes to the following:

```
User's input
     |
  Switcher <-------> Store
                      ^ |
                      | |
                      | |
                      | v
    Service communicating
    with our backend
```

All this leads to managing two states instead of one. What if the `Store` changes its value based on other actions in the system. We have to propagate that change to the `Switcher` and we increase the complexity of our app.

One-way direction data flow solves this problem. It eliminates the multiple states and deals with only one which is usually inside the store. To achieve that we have to tweak our `Store` object a little bit. We need logic that allows us to subscribe for changes:

```js
var Store = {
  _handlers: [],
  _flag: '',
  onChange: function(handler) {
    this._handlers.push(handler);
  },
  set: function(value) {
    this._flag = value;
    this._handlers.forEach(handler => handler())
  },
  get: function() {
    return this._flag;
  }
};
```

Then we will hook our main `App` component and we'll re-render it every time when the `Store` changes its value:

```js
class App extends React.Component {
  constructor(props) {
    super(props);
    Store.onChange(this.forceUpdate.bind(this));
  }
  render() {
    return (
      <div>
        <Switcher
          value={ Store.get() }
          onChange={ Store.set.bind(Store) } />
      </div>
    );
  }
};
```

*(Notice that we are using [`forceUpdate`](https://facebook.github.io/react/docs/component-api.html#forceupdate) which is not really recommended. Normally a [high-order component](https://github.com/krasimir/react-in-patterns/tree/master/patterns/higher-order-components) is used to enable the re-rendering. We used `forceUpdate` just to keep the example simple.)*

Because of this change the `Switcher` becomes really simple. We don't need the internal state:

```js
class Switcher extends React.Component {
  constructor(props) {
    super(props);
    this._onButtonClick = e => {
      this.props.onChange(!this.props.value);
    }
  }
  render() {
    return (
      <button onClick={ this._onButtonClick }>
        { this.props.value ? 'lights on' : 'lights off' }
      </button>
    );
  }
};
```

The benefit that comes with this pattern is that our components become dummy representation of the `Store`'s data. It's really easy to think about the React components as views (renderers). We write our application in a declarative way and deal with the complexity in only one place.

The diagram of the application changes to:

```
Service communicating
with our backend
    ^
    |
    v
  Store <-----
    |        |
    v        |
Switcher ---->
    ^
    |
    |
User input
```

As we can see the data flows in only one direction and there is no need to sync two (or more) parts of our system. One-way direction data flow is not only about React based apps. Proved many times that makes the applications easy to reason about. It may need a little bit more wiring but it definitely worth it.

## Summary

For sure, these are not the all design patterns/techniques that we can see in React. There are probably dozens more. Check out [github.com/krasimir/react-in-patterns](https://github.com/krasimir/react-in-patterns) regularly for updates. I'll try posting my new findings there.
