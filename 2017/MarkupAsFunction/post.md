# Markup as function

If you are writing React applications you probably know about [higher order components](http://krasimirtsonev.com/blog/article/react-the-powerful-higher-order-component-pattern) or [render props](https://cdb.reacttraining.com/use-a-render-prop-50de598f11ce) (which by the way I think is kind of a form of higher order component pattern). In both cases we have a component that encapsulates logic and passes props down to children. Recently at work we came to the idea that we may push this further and represent some functionalities which are out of React in the same fashion - with a single tag in our components tree.

Recently I also saw this on Twitter:

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">In <a href="https://twitter.com/hashtag/React?src=hash&amp;ref_src=twsrc%5Etfw">#React</a>-land: is it legit to have a component that only *does* stuff, but isn&#39;t visible? i.e. for setting cookie from a dispatched redux action, or kick off a background task, etc.</p>&mdash; @rem (@rem) <a href="https://twitter.com/rem/status/936319265795428354?ref_src=twsrc%5Etfw">November 30, 2017</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

The idea is interesting so I decided to experiment and see the pros and cons. Imagine how we add/compose functionality with markup only. Instead of doing it in a JavaScript function we just drop a tag. But let's do couple of examples and see how it looks like.

No matter what we use for our React applications we always have that mapping between logic layer and rendering layer. In the Redux land this is the so called `connect` function where we say map this portion of the state to props or map this actions to this props.

```js
function Greeting({ isChristmas }) {
  return (
    &lt;p>
      { this.props.isChristmas ? 'Merry Christmas' : 'Hello' } dear user!
    &lt;/p>
  );
}

const mapStateToProps = state => ({ isChristmas: state.calendar.isChristmas });

export default connect(mapStateToProps)(Greeting);
```

`isChristmas` is just a boolean for `Greeting`. The component doesn't know where this boolean is coming from. We may easily extract the function into an external file which will make it completely blind for Redux and friends. That is fine and it works well. But what if we have the following:

```js
import IsChristmas from './IsChristmas.jsx';

export default function Greeting() {
  return (
    &lt;div>
      &lt;IsChristmas>
        { answer => answer ? 'Merry Christmas' : 'Hello' }
      &lt;/IsChristmas>
    &lt;/div>
  );
}
```

Now `Greeting` does not accept any properties but still does the same job. It is the `IsChristmas` component having the wiring and fetching the knowledge from the state. Then we have the [render props pattern](https://cdb.reacttraining.com/use-a-render-prop-50de598f11ce) to make the decision what string to render.

```js
// IsChristmas.jsx

const IsChristmas = ({ isChristmas, children }) => children(isChristmas);

export default connect(
  state => ({ isChristmas: state.calendar.isChristmas })
)(IsChristmas);
```

Using this technique we are shifting the dependency of the state to an external component. `Greeting` becomes a composition layer with zero knowledge of the application state.

This example is a simple one and looks pointless. Let's go with a more [complicated scenario](https://codesandbox.io/s/rlrr1lq53q):

```js
function LoginForm() {
  return (
    &lt;UserDataProvider>{
      user => (
        &lt;ActionsProvider>{
          actions => (
            &lt;section>
              Hello, { user.fullName },
              please &lt;a onClick={ actions.purchase }>order&lt;/a> here.
            &lt;/section>
          )
        }&lt;/ActionsProvider>
      )
    }&lt;/UserDataProvider>
  )
}
```

We have two _providers_ the role of which is to deliver (a) some data for the current user and (b) a redux action creator `purchase` so we can fire it when the user click on the `order` link. These providers are nothing more then functions that use the `children` prop as a regular function:

```js
// UserDataProvider.jsx
function UserDataProvider({ children }) {
  return children({ fullName: 'Jon Snow'});
}
connect(state => ({ user: state.user }))
  (UserDataProvider);

// ActionsProvider.jsx
function ActionsProvider({ children }) {
  return children({ purchase: () => alert('Woo') });
}
connect(null, dispatch => ({ purchase: () => dispatch(purchaseActionCreator()) }))
  (UserDataProvider);
```

This idea shifts the dependencies resolution into JSX syntax which to be honest I really like. We don't have to know about wiring and on a later stage we may completely swap the provider by just re-implementing the component. For example in the code above if we say that the user's data comes from the cookie and not from a Redux's store we may just change the body of the `UserDataProvider`.

Of course I so see some problems with this approach. First, testing wise we still need the same setup to make our main component testable. `LoginForm` still needs the Redux stuff because its internal components are using them. While if we do the wiring directly to `LoginForm` we will get `user` and `purchase` as props and we could mock them. Second, the code looks a little bit ugly if we need to use the render props pattern.

Overall, I don't know :) The idea seems interesting but as with most of the patterns can not be applied to every case. Let's see how it evolves and I will post an update soon.