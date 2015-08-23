# How require/import may decrease your testability

When [CommonJS](http://www.commonjs.org/) was announced we all thought "Finally something that will organize our code". However, there are some cons that we should be aware of. It's not only unicorns and rainbows. In this article we will see how a simple `require` line makes our code difficult to test.

## What is all this about

Let me give you an example so we see what I'm talking about. Consider the following `login.js` module:

```
// login.js
var http = require('./http');

module.exports = function(username, password) {
  var url = '/api/login';
  var credentials = {
    username: username,
    password: password
  };

  return http
    .credentials(credentials)
    .url(url)
    .request();
  }
};
```
`login.js` accepts `username` and `password`. It performs HTTP request to a given endpoint and returns a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). 

Here is another piece of code that uses the module that we just created:

```
// app.js
var login = require('login');

login('user', '1234')
  .then(function(user) {
    console.log('User ' + user.fullName + ' logged in.');
  })
  .catch(function(error) {
    console.log('Ops, something goes wrong!');
  });
```

There is one other bit that we didn't talk about. That is the `http` module. It is an utility module that contains the code for the actual request. The whole picture looks like that:

```
app.js
  |
  login.js
    |
    http.js
```

So far nothing unusual but if we start thinking about testing we will see that the solution is not easily testable. Let's say that `http.js` is a third party library and we are writing no tests for it. `app.js` is our orchestration code so we will cover it with [e2e](https://en.wikipedia.org/wiki/System_testing) tests. The middle layer `login.js` is suitable for unit testing. If we have to write a test using [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin) language we'll end up with:

```
describe('Given the login module', function () {
  describe('when we send correct username and password', function () {
    it('should return a promise that resolves', function () {
      // ...
    });
  });
  describe('when we send wrong username and password', function () {
    it('should return a promise that will be rejected', function () {
      // ...
    });
  });
});
```
We will pull the login function from `login.js` and will run it with different parameters. However, the logic that decides the result of the whole operation is in `http.js`. We can't cover all the cases because we don't have control on all the parts.

`http.js` dependency makes our module difficult to test. We don't want to perform real HTTP requests and we want to control the promise that is returned by the module. Right now that's not exactly possible.

Oh wait, what if `http.js` is an abstraction on top of [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest). Isn't it possible mocking that global object and it's API?

```
|
login.js
  |
  http.js
    |
    XMLHttpRequest (fake one)
    Here we control the process.
    We don't make actual HTTP request.
```

Sorry, no. That's an overkill. What we do is using context specific knowledge of the system to solve design problem. That's definitely a wrong approach because we may have similar dependency tree that ends with a module which we can't fake.

## Factory pattern to the rescue

The real problem is that we define the dependencies of `login.js` inside the module. By doing this we can't control them from the outside. [Factory design pattern](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#factorypatternjavascript) is one of the possible solutions here. Our module may be changed to the following:

```
// login.js
module.exports = {
  create: function (http) {
    return function(username, password) {
      var url = '/api/login';
      var credentials = {
        username: username,
        password: password
      };

      return http
        .credentials(credentials)
        .url(url)
        .request();
      }
    }
  }
}
```
And we use it by sending the third party library in `app.js`;

```
// app.js
var http = require('./http');
var login = require('login').create(http);

login('user', '1234')
  .then(function(user) {
    console.log('User ' + user.fullName + ' logged in.');
  })
  .catch(function(error) {
    console.log('Ops, something goes wrong!');
  });
```

After these changes `login.js` module is easily unit testable because we may mock the *used* API of `http.js`. 

The lines below are showing the complete test. I used a helper library called [Sinon](http://sinonjs.org/docs/) to spy and stub modules but the same result may be achieved with vanilla JavaScript.

```
var sinon = require('sinon');
var Login = require('../app/src/login');
var createFakeHTTP = function (promise) {
  return {
    credentials: sinon.spy(),
    url: sinon.spy(),
    request: sinon.stub().returns(promise)
  };
};

var success = new Promise(function(resolve, reject) {
  resolve();
});
var fail = new Promise(function(resolve, reject) {
  reject();
});

describe('Given the login module', function () {
  describe('when we send correct username and password', function () {
    it('should return a promise that resolves', function (done) {
      var http = createFakeHTTP(success);
      var login = Login.create(http);
      login('user', '1234').then(done);
    });
  });
  describe('when we send wrong username and password', function () {
    it('should return a promise that will be rejected', function (done) {
      var http = createFakeHTTP(fail);
      var login = Login.create(http);
      login('user', '1234').catch(done);
    });
  });
});
```

## Summary

It is clear that we can't write everything in one file and we should use `require` (or `import`). However, we should make sure that our code stays testable. Thankfully there are some design patterns that may help us. All we have to do is thinking about testing while designing our applications.