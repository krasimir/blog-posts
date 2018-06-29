# A story about React, Redux and server-side rendering

*Long long time ago in a kingdom far far away there was an app. The app was supported by the well known React and Redux families but there was a problem. It was damn slow. People started complaining and the app had to do something. It had to deliver its content quickly so it provides better user experience. Then the server-side rendering was born.*

Today we are going to build a simple React application that uses Redux. Then we will server-side render it. The example includes asynchronous data fetching which makes the task a little bit more interesting.

## Setup

Before even starting with writing the application we have to deal with a building/compiling processes. We want to write our code in ES6 syntax which means that our code needs to be transpiled to ES5 so it can be used by browsers and node. We also have to bundle our client-side code. I already blogged on that topic some time ago - [
The bare minimum to work with React](http://krasimirtsonev.com/blog/article/The-bare-minimum-to-work-with-React). The approach that we will take in this article is similar. We will use [browserify](https://www.npmjs.com/package/browserify) and [watchify](https://www.npmjs.com/package/watchify) with [babelify](https://www.npmjs.com/package/babelify) transform to bundle our client side code. For our server side code we will directly rely on [babel-cli](https://babeljs.io/docs/en/babel-cli). 

We will start with the following file structure:

```
build
src
  ├── client
  │   └── client.js
  └── server
      └── server.js
```

And we need two scripts to build and develop the project.

```
"scripts": {
    "build": "
      browserify ./src/client/client.js -o ./build/bundle.js -t babelify &&
      babel ./src/ --out-dir ./build/",
    "watch": "
      concurrently 
        \"watchify ./src/client/client.js -o ./build/bundle.js -t babelify -v\"
        \"babel ./src/ --out-dir ./build/ --watch\"
      "
}
```

*(Notice that I added the new lines and spaces for readability reasons)*

[concurrently](https://www.npmjs.com/package/concurrently) library helps running more then one process in parallel which is exactly what we need when watching for changes.

There is one last script that we need. The one that runs our HTTP server.

```
"scripts": {
  "build": "...",
  "watch": "...",
  "start": "nodemon ./build/server/server.js"
}
```

Instead of just `node ./build/server/server.js` we will use [nodemon](https://nodemon.io/). Nodemon is an utility that will monitor for any changes in our code and it will automatically restart the server.

## Developing the React + Redux application

Let's say that we have an endpoint that returns data for the users in our system in the following format:

```js
[
  {
    "id": <number>,
    "first_name": <string>,
    "last_name": <string>,
    "avatar": <string>
  },
  {
    ...
  }
]
```

And our task is to get that data and render it. To keep the example simple we will do that with just one `<App>` component. In the `componentWillMount` lifecycle method of this component we will trigger the data fetching and once the request succeeds we will dispatch an action with type `USER_FETCHED`. That action will be processed by a reducer and we will get an update in the our Redux store. And that state change will trigger a re-rendering of our component with the given data.

![main redux flow](./redux.jpg)

### Implementing the Redux pattern

Let's first start by modeling our application state. The endpoint returns an array of user profiles so we may go with the following:

```js
{
  users: <array>|null
}
```

Initially `users` contains `null` and when the data arrives it gets replaced with an array of objects. The reducer that handles our `USER_FETCHED` array looks like that:

```js
// reducer.js
import { USERS_FETCHED } from './constants';

function getInitialState() {
  return { users: null };
}

const reducer = function (oldState = getInitialState(), action) {
  if (action.type === USERS_FETCHED) {
    return { users: action.response.data };
  }
  return oldState;
};
```

We also need an action creator which will be used in the `<App>` component and a selector so we can pull the `users` from the application state.

```js
// actions.js
import { USERS_FETCHED } from './constants';
export const usersFetched = response => ({ type: USERS_FETCHED, response });

// selectors.js
export const getUsers = ({ users }) => users;
```

The last bit regarding the Redux implementation is the creation of the store. We will write a simple factory function/helper for that.

```js
// store.js
import { USERS_FETCHED } from './constants';
import { createStore } from 'redux';
import reducer from './reducer';

export default () => createStore(reducer);
```

Why a factory function and not directly returning `createStore(reducer)`? That is because when we server-side render we will need a brand new instance of the store for every request.

### Writing the React component (`<App>`)

We have to mention something important here. If we want to server-side render something we have to change our mindset a little bit. We have to think carefully about what our code does and is that thing possible on the server. For example, if we access the `window` object we have to rethink our component or use a wrapper because we don't have `window` on the server side. The following code is the implementation of our `<App>` component.

```js
// App.jsx
import React from 'react';
import { connect } from 'react-redux';

import { getUsers } from './redux/selectors';
import { usersFetched } from './redux/actions';

const ENDPOINT = 'http://localhost:3000/users_fake_data.json';

class App extends React.Component {
  componentWillMount() {
    fetchUsers();
  }
  render() {
    const { users } = this.props;

    return (
      <div>
        {
          users && users.length > 0 && users.map(
            // ... render the user here
          )
        }
      </div>
    );
  }
}

const ConnectedApp = connect(
  state => ({
    users: getUsers(state)
  }),
  dispatch => ({
    fetchUsers: async () => dispatch(
      usersFetched(await (await fetch(ENDPOINT)).json())
    )
  })
)(App);

export default ConnectedApp;
```

Notice that we are using `componentWillMount` and not `componentDidMount`. The main reason is because we don't have `componentDidMount` fired on the server-side. *(React's team also depricated those methods but that is another story.)*

`fetchUsers` is an async function passed as a prop which uses the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to retrieve the data from the fake endpoint. When both promises returned by `fetch()` and `json()` functions are resolved we dispatch the `USERS_FETCHED` action. Later the reducer picks it up and returns the new state containing the users' data. And because our `App` component is *connect*ed to Redux it gets re-rendered.

The client-side code ends with the placement of `<App>` component on the page.

```js
// client.js
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './App.jsx';
import createStore from './redux/store';

ReactDOM.render(
  <Provider store={ createStore() }><App /></Provider>,
  document.querySelector('#content')
);
```

## Running the Node server

The most trivial approach for running a HTTP server in JavaScript is using [Express](https://expressjs.com/) library. We will use it first because it is simple and helps the purpose of this article and second because it is anyway pretty stable solution.

```js
// server.js
import express from 'express';

const app = express();

// Serving the content of the "build" folder. Remember that
// after the transpiling and bundling we have:
//
// build
//   ├── client
//   ├── server
//   │   └── server.js
//   └── bundle.js
app.use(express.static(__dirname + '/../'));

app.get('*', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(`
    <html>
      <head>
        <title>App</title>
      </head>
      <body>
        <div id="content"></div>
        <script src="/bundle.js"></script>
      </body>
    </html>
  `);
});

app.listen(
  3000,
  () => console.log('Example app listening on port 3000!')
);
```

Having this file we may run `npm run start` and visit `http://localhost:3000`. We will see the application working. The data will be fetched and the users will be rendered.

## The server-side rendering

It all works so far but everything is happening on the client. This means that our server initially sends a blank page to the user. Then the browser needs to download `bundle.js` and runs it. Once the data fetching happens we show the result to the user. And here is where the server-side rendering comes in to the game. Instead of leaving all the work for the browser we may do everything on the server and send the final markup. And then React is smart enough to understand the markup that is currently on the page and reuse it.

The API of React that we have to use in node is delivered by the [react-dom](http://npmjs.com/package/react-dom) package. Remember how on the client we did the following:

```js
import ReactDOM from 'react-dom';

ReactDOM.render(
  <Provider store={ createStore() }><App /></Provider>,
  document.querySelector('#content')
);
```

Well, on the server is almost the same.

```js
import ReactDOMServer from 'react-dom/server';

const markupAsString = ReactDOMServer.renderToString(
  <Provider store={ store }><App /></Provider>
);
```

We use the same `<App>` component and the same store. It is just a different React API that returns a string instead of rendering into a DOM element. Later we inject that string in our Express response and the user receives some server-side rendered markup. So our `server.js` changes to:

```js
const store = createStore();
const content = ReactDOMServer.renderToString(
  <Provider store={ store }><App /></Provider>
);

app.get('*', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(`
    <html>
      <head>
        <title>App</title>
      </head>
      <body>
        <div id="content">${ content }</div>
        <script src="/bundle.js"></script>
      </body>
    </html>
  `);
});
```

If we restart the server and open the same `http://localhost:3000` page we will see the following response:

```html
<html>
  <head>
    <title>App</title>
  </head>
  <body>
    <div id="content"><div data-reactroot=""></div></div>
    <script src="/bundle.js"></script>
  </body>
</html>
```

We do have some content inside our container but it is just `<div data-reactroot=""></div>`. This doesn't mean that something is broken. It is absolutely correct. React indeed renders our page but it renders only the static content. In our `<App>` component we have nothing until we get the data and on the server we simply don't give enough time for all this to happen. The fetching of the data is an asynchronous process and we have to take this into account when render on the server. And this is where our task becomes tricky. It really boils down to what our application is doing. In this acticle the client-side code depends on one specific request but it could be many requests or maybe a completed root saga if [redux-saga](https://redux-saga.js.org/) library is used. I recognize two ways of dealing with the problem:

* We know exactly what the requested page needs. We fetch the data and create the Redux store with that data. Then we render the page by giving the fulfilled store and in theory we should get the whole markup.
* We rely completely on the code that runs on the client and we wait till everything there is completed.

The first approach requires some level of routing and it means that we have to manage the data flow on two different places. The second approach means that we have to be careful with what we do on the client and make sure that the same thing may happen on the server. Even though sometimes it requires more efforts I prefer that second approach because I have to maintain single code base. It just takes a little bit more instrumentation on the server to make this possible. Like for example in our case we use [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to make the request to the endpoint. On the server we don't have this by default. Thankfully there is a [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch) package that adds `fetch` method as a global function. All we have to do is to import it somewhere before the usage of `fetch`. Like in `server.js`:

```js
import 'isomorphic-fetch';
```

Once we deal with the APIs that the client code uses we have to render and wait till the data is in the store. Once this is done we fire `ReactDOMServer.renderToString` which will give us the desired markup. Here is how our Express handler looks like:

```js
app.get('*', (req, res) => {
  const store = createStore();

  const unsubscribe = store.subscribe(() => {
    const users = getUsers(store.getState());

    if (users !== null && users.length > 0) {
      unsubscribe();

      const content = ReactDOMServer.renderToString(
        <Provider store={ store }><App /></Provider>
      );

      res.set('Content-Type', 'text/html');
      res.send(`
        <html>
          <head>
            <title>App</title>
          </head>
          <body>
            <div id="content">${ content }</div>
            <script src="/bundle.js"></script>
          </body>
        </html>
      `);
    }
  });

  ReactDOMServer.renderToString(<Provider store={ store }><App /></Provider>);
});
```

We are using the `subscribe` method of the Redux store to understand when an action is dispatched or the state is updated. Once this happen we check the condition that we are interested in - is there any user data fetched. If the data is there we `unsubscribe()` so we don't have the same code running twice and we render to string using the same store instance. At the end we flush out the markup to the browser.

There is one thing which bugs me and I still didn't find a proper solution. We have to render twice. We have to do that because the processes that we wait to finish start only when we render. Remember how we fire `fetchUsers` in `componentWillMount` hook. Without rendering the `<App>` component we are not firing the fetch request which means we don't have the store updated.

With that code above we have our `<App>` component successfully server-side rendered. We are getting the following markup straight away from the server:

```html
<html>
  <head>
    <title>App</title>
  </head>
  <body>
    <div id="content"><div data-reactroot=""><p>Eve Holt</p><p>Charles Morris</p><p>Tracey Ramos</p></div></div>    
    <script src="/bundle.js"></script>
  </body>
</html>
```

Now the users are rendered. And of course React is able to understand the HTML and works with it. But we are not done yet. The client-side JavaScript has no idea what happened on the server and doesn't know that we already did the request to the API. We have to inform the browser by passing down the state of the Redux store so it can pick it up.

```js
const content = ReactDOMServer.renderToString(
  <Provider store={ store }><App /></Provider>
);

res.set('Content-Type', 'text/html');
res.send(`
  <html>
    <head>
      <title>App</title>
    </head>
    <body>
      <div id="content">${ content }</div>
      <script>
        window.__APP_STATE = ${ JSON.stringify(store.getState()) };
      </script>
      <script src="/bundle.js"></script>
    </body>
  </html>
`);
```

We send the store's state as a global variable `__APP_STATE` which the client-side code is responsible to look for. Our reducer changes a little bit too. We have a function `getInitialState` which we have to update:

```js
function getInitialState() {
  if (typeof window !== 'undefined' && window.__APP_STATE) {
    return window.__APP_STATE;
  }
  return { users: null };
}
```

Notice `typeof window !== 'undefined'` check. We have to do that because this same reducer is run on the server. This is a perfect example of how we have to be careful with the globally available browser APIs when using SSR.

As a last optimization we also have to avoid doing the `fetch` when the data is already in the store. A little check in the `componentWillMount` method will do the trick:

```js
componentWillMount() {
  const { users, fetchUsers } = this.props;

  if (users === null) {
    fetchUsers();
  }
}
```

## Conclusion

Server-side rendering is an interesting topic. It comes with a lot of advantages and improves the overall user experience. It also affects the SEO of your single page applications. It is not simple though. In most of the cases requires additional instrumentation and carefully selected APIs. How is the SSR happening in your apps? Is it similar to what we discussed so far?