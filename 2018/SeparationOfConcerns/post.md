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