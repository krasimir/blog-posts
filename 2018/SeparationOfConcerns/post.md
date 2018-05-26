# React and separation of concerns

Years ago when Facebook announced their JSX syntax we had a wave of comments how this is against some of the well established good practices. The main point of most people was that it violates the separation of concerns. They said that React and its JSX are mixing HTML, CSS and JavaScript which were suppose to be separated.

In this article we will see how React and its ecosystem has quite good separation of concerns. We will prove that markup, styles and logic may live in the same JavaScript land and still be separated.

## Styling

React components render to DOM elements. Nothing stops us to use the good old `class` attribute and attach a CSS class to the produced HTML element. The only difference is that the attribute is called `className` instead of `class`. The rest still works which means that if we want we may put our styles into external `.css` files. It is clear that following this approach we are not breaking the separation of concerns principle.

```js
// assets/css/styles.css
.pageTitle {
  color: pink;
}

// assets/js/app.js
function PageTitle({ text }) {
  return <h1 className='pageTitle'>{ text }</h1>;
}
```

The "problem" became a problem when [developers](https://vimeo.com/116209150) started talking about "CSS in JavaScript". Back in 2014 this looked weird and wrong. However, the next couple of years showed that this is not bad at all. Let's take the following example:

```js
function UserCard({ name, avatar }) {
  const cardStyles = {
    padding: '1em',
    boxShadow: '0px 0px 45px 0px #000'
  };
  const avatarStyles = {
    float: 'left',
    display: 'block',
    marginRight: '1em'
  };
  return (
    <div style={cardStyles}>
      <img src={avatar} width="50" style={avatarStyles} />
      <p>{name}</p>
    </div>
  );
}
```

Even at this point we could say that we have some clear separation of responsibilities. The `UserCard` component hides markup and styling and only has the data (`name` and `avatar`) as input. Imagine how this component is used across the app - `<UserCard name='...' avatar='...' />`. We don't know what is inside, how is styled or how is structured. All we know is that we render user's info on the screen.

But let's go back to the inlined styling with `cardStyles` and `avatarStyles` constants. This is the pain point. The place where we "mix" CSS and markup. I will shift the perspective a little bit and will say that we "mix" styling and structure. To solve the issue let's keep `UserCard` still responsible for the structure, but extract the styling into dedicated components `Card` and `Avatar`:

```js
function Card({ children }) {
  const styles = {
    padding: '1em',
    boxShadow: '0px 0px 45px 0px #000',
    maxWidth: '200px'
  };
  return <div style={styles}>{children}</div>;
}
function Avatar({ url }) {
  const styles = {
    float: 'left',
    display: 'block',
    marginRight: '1em'
  };
  return <img src={url} width="50" style={styles} />;
}
```

Then `UserCard` component becomes simpler and has no styling concerns:

```js
function UserCard({ name, avatar }) {
  return (
    <Card>
      <Avatar url={avatar} />
      <p>{name}</p>
    </Card>
  );
}
```

So, as we can see it is all matter of composition. In my opinion React even makes our applications more compact because everything is defined as a reusable components and lives in the same context - JavaScript.

There are bunch of libraries that help writing maintainable CSS in JavaScript (and to be more specific in React ecosystem). I have experience with [Glamorous](https://glamorous.rocks/) and [styled-components](https://www.styled-components.com/) and I could say that they both work really well. The result of such libraries is usually a ready for use component that encapsulates the styling and renders a specific HTML tag.

## Logic

Very often we write logic inside our React components which is more then clicking a button and showing a message. The snippet below demonstrates a component that fetches data from a fake API and renders users on the screen.

```js
class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      users: null,
      error: null
    };
  }
  componentDidMount() {
    this.setState({ loading: true }, () => {
      fetch('https://jsonplaceholder.typicode.com/users')
        .then(response => response.json())
        .then(users => this.setState({ users, loading: false }))
        .catch(error => this.setState({ error, loading: false }));
    });
  }
  render() {
    const { loading, users, error } = this.state;

    if (isRequestInProgress) return <p>Loading</p>;
    if (error) return <p>Ops, sorry. No data loaded.</p>;
    if (users) return users.map(({ name }) => <p>{name}</p>);
    return null;
  }
}
```

Quite a lot of things are happening isn't it. When first rendered the component shows nothing - `null`. Then we get the life-cycle `componentDidMount` method fired where we set the `loading` flag to `true` and fire the API request. While the request is in flight we display a paragraph containing the text `"Loading"`. In the end if everything is ok we turn `loading` to false and render list of user names. In case of error we display `"Ops, sorry. No data loaded"`.

Now I agree that the `App` component is kind of violating the separation of concerns. It contains data fetching and data representation. There are couple of ways to solve this problem and my favorite one is [FaCC (Function as Child Components)](https://github.com/krasimir/react-in-patterns/blob/master/book/chapter-4/README.md#function-as-a-children-render-prop). Let's write a `FetchUsers` component that will take care for the API request.

```js
class FetchUsers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      users: null,
      error: null
    };
  }
  componentDidMount() {
    this.setState({ loading: true }, () => {
      fetch('https://jsonplaceholder.typicode.com/users')
        .then(response => response.json())
        .then(users => this.setState({ users, loading: false }))
        .catch(error => this.setState({ error, loading: false }));
    });
  }
  render() {
    const { loading, users, error } = this.state;

    return this.props.children({ loading, users, error });
  }
}
```

The very first thing that we notice is that the constructor and `componentDidMount` method body are the same. The difference is that we render nothing (no data representation) but call the `children` as a function passing the status/result of the request. Having `FetchUsers` we may transform our `App` component into a stateless one.

```js
function App() {
  return (
    <FetchUsers>
      {({ loading, users, error }) => {
        if (loading) return <p>Loading</p>;
        if (error) return <p>Ops, sorry. No data loaded.</p>;
        if (users) return users.map(({ name }) => <p>{name}</p>);
        return null;
      }}
    </FetchUsers>
  );
}
```

At this point our markup is separated from the logic. We still operate with the same data though and as a bonus we have this reusable `FetchUsers` component that may be dropped anywhere.

## Markup

JSX syntax is following the XML/HTML semantics and as such comes with a huge benefit - composability. My opinion is that React is one level up over the HTML because it allows us to group complex markup into a single component. What if we have a `<header>` with some `<h1>`, `<nav>` and `<p>` tags inside. We may easily create a `<Header>` component and put all those bits inside. We still keep them together but now they are easy to move around.

## Conclusion

No, I don't think that React is against the separation of concerns. It is matter of design and composition. There are [patterns](https://github.com/krasimir/react-in-patterns) that help solving such problems and we can still write well organized apps with clearly defined modules responsibilities.