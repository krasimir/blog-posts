# A story about React, Redux and server-side rendering

Long long time ago in a kingdom far away there was an app. The app was supported by the well known React and Redux families but there was a problem. It was damn slow. People started complaining and the app had to do something. It had to deliver its content quickly so it provides better user experience. Then the server-side rendering was born.

Today we are going to build a simple React application that uses Redux. Then we will server-side render it. The example includes asynchronous data fetching which makes the task a little bit more interesting.

## Setup

Before even starting with React we have to deal with some setup. We want to write our code using ES6 syntax which means that our code needs to be transpiled to ES5 before to be used. Transpilation is one of the things but we also need to bundle it. I already blogged on that topic some time ago - [
The bare minimum to work with React](http://krasimirtsonev.com/blog/article/The-bare-minimum-to-work-with-React). The approach that we will take in this article is similar. We will use [browserify](https://www.npmjs.com/package/browserify) and [watchify](https://www.npmjs.com/package/watchify) with [babelify](https://www.npmjs.com/package/babelify) transform to bundle our client side code. For our server side code we will directly rely on [babel-cli](https://babeljs.io/docs/en/babel-cli). 

Having the following file structure

```
build
src
  ├── client
  │   └── client.js
  └── server
      └── server.js

```

we need these two scripts to build and develop the project.

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

*(Notice that I added the new lines and spaces for easy reading)*

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

## React/Redux application

Let's say that we have an endpoint that returns data for the users in our system. And our task is to get that data and render it. To keep the example simple we will do that with a single `<App>` component. In the `componentWillMount` lifecycle method we will trigger the data fetching and once the request succeeds we will dispatch an action which will update the store's state. Which will trigger a re-rendering of our component.

![main redux flow](./img1.jpg)

### Implementing Redux pattern

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

Why a factory function and not directly returning `createStore(reducer)`. That is because when we server-side render we will need an instance of the same store but it needs to be a new one for every request.

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

Notice that we are using `componentWillMount` and not `componentDidMount`. That is because we don't have `componentDidMount` running on the server-side.

`fetchUsers` is an async function passed as a prop which uses the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to retrieve the data from the fake endpoint. When the both promises returned by `fetch` and `json` functions are resolved we dispatch the `USERS_FETCHED` action. The reducer picks it up and returns the new state containing the users' information. And because our `App` component is *connect*ed to Redux it gets re-rendered.

The last bit for the client-side is where we place an instance of `<App>` in the actual DOM.

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

The most trivial approach for running a HTTP server in JavaScript is using [Express](https://expressjs.com/). We will do the same. 
