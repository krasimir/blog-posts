If you write JavaScript nowadays you probably use some sort of a transpilation step. The most popular one involves [Babel](https://babeljs.io/). A tool that reads your hipster code and convert it to code that works in the browser. In this article we are going to see what is actually send to the browser and how exactly tools like Babel polyfill some of the ES6 features.

It is also interesting on what price. Some of the syntax like async/await may be a little bit expensive. I mean as a file size. But let's start with something simple - the arrow function.

## The `this` problem

Back in the days I came to JavaScript from ActionScript and PHP. I used these both languages a lot and they both had (still have) classes. However, in JavaScript we had only a prototype as a tool for inheritance and OOP. And because the functions in JavaScript are first class citizens and they define a new scope we had to use the word `this` a lot. The problem was that `this` is not always pointing to what we want and this leads to variables like `that` or `self`. Years later we got the arrow function definition and it seems that the problems slowly goes away. Here is an small example:

```js
const Person = function (firstName, lastName, sex) {
  const getProperName = function () {
    return (sex === 'm' ? 'Mr. ' : 'Ms. ') +
      this.firstName + ' ' + this.lastName;
  }

  this.firstName = firstName;
  this.lastName = lastName;
  this.name = getProperName();
}

// The following leads to an error:
// Cannot read property 'firstName' of undefined
const user = new Person('John', 'Smith', 'm');
```

We defined a *class* `Person` and inside the constructor there is `getProperName` that produces a nice name like `Mr. John Smith`. That's fine but the above code does not work because we are using `this` in a scope which has no `firstName` and `lastName`. The arrow function definition is a perfect solution for this problem:

```js
const Person = function (firstName, lastName, sex) {
  const generateFullName = () => {
    return (sex === 'm' ? 'Mr. ' : 'Ms. ') +
      this.firstName + ' ' + this.lastName;
  }

  this.firstName = firstName;
  this.lastName = lastName;
  this.fullName = generateFullName();
}

// Now user is an object with three properties:
// { firstName: "John", lastName: "Smith", fullName: "Ms. John Smith" }
const user = new Person('John', 'Smith', 'm');
```

That's nice but how Babel transpiles this code. It probably knows what `() => {` means but what about the `this` keyword. Here is how the code looks like:

```js
var Person = function Person(firstName, lastName, sex) {
  var _this = this;

  var generateFullName = function generateFullName() {
    return (sex === 'm' ? 'Mr. ' : 'Ms. ') + _this.firstName + ' ' + _this.lastName;
  };

  this.firstName = firstName;
  this.lastName = lastName;
  this.fullName = generateFullName();
};
```

It solved the problem by using a temporary variable `_this` that points to correct context. Pretty much what we were doing for years. Thankfully we don't have to think about it anymore.

If we compare the file size the two snippets we will see just 41 bytes difference.

## Template literal

I am convinced that the ES6 template literal is just a better way to work with strings in JavaScript. At first the transpiling looks pretty easy - simple concatenation:

```js
const greeting = function(user) {
  return `Hello ${ user.fullName }, how are you?`;
}
```

gets translated to:

```js
var greeting = function greeting(user) {
  return "Hello " + user.fullName + ", how are you?";
};
```

However, the tagged template literals are completely different story. Let's consider the following code:

```js
const censor = function (strings, name) {
  return strings[0] + name.charAt(0) + '...' + strings[1];
}
const greeting = function(name, salary) {
  return censor`Hello ${ name },\nHow are you?`;
}

// Outputs:
/* 
  Hello J...,
  How are you?
*/
greeting('John Smith');
```

The idea is that we display just the first letter of the person's name. The rest is just replaced with three dots. In addition we are calculating the amount of taxes payed. Now, let's see how this code works in a browser that does not support template literals.

```js
var _templateObject = _taggedTemplateLiteral(
  ['Hello ', ',\nHow are you?'],
  ['Hello ', ',\\nHow are you?']
);

function _taggedTemplateLiteral(strings, raw) {
  return Object.freeze(
    Object.defineProperties(strings, {
      raw: { value: Object.freeze(raw) }
    })
  );
}

var censor = function censor(strings, name) {
  return strings[0] + name.charAt(0) + '...' + strings[1];
};
var greeting = function greeting(name, salary) {
  return censor(_templateObject, name);
};

greeting('John Smith');
```

The `censor` function stays untouched and the place where we defined the tagged template literal is now a simple function call of exactly that `censor` function. However we now have code that prepares the array that we receive. By specification the first argument of the tagging method is an array of strings. The remaining arguments are related to the expressions. That first array has also a `raw` property that is again the same array of strings but without escaping. The `_taggedTemplateLiteral` helper is there to ensure that we receive an object that can't be modified (the usage of `Object.freeze`).

What happens if we add another template literal is that we got a new `_templateObject` definition. Then `_taggedTemplateLiteral` is getting used again. The difference between original and transpiled code in file size is 261 bytes.

## Destructuring

Destructuring is one of my favorite features. I'm using it wherever possible because it removes some boilerplate and very often eliminates naming problems. Here is an example of couple of destructing usages:

```js
function printData({ data }) {
  const { name, properties } = data;
  const [ age ] = properties;
  
  console.log(name + ', age: ' + age);
}

printData({
  data: {
    name: 'John',
    properties: [34, 180, 90]
  }
});
```

We have destructing of function arguments then destructing of an object literal and array. The transpiled code is as follows:

```js
var _slicedToArray = function() {
  function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

  return function(arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

function printData(_ref) {
  var data = _ref.data;
  var name = data.name,
    properties = data.properties;

  var _properties = _slicedToArray(properties, 1),
    age = _properties[0];

  console.log(name + ', age: ' + age);
}

printData({
  data: {
    name: 'John',
    properties: [34, 180, 90]
  }
});
```

So, not that simple isn't it. I thought before about how polyfilling of destruting looks like and for it was always just defining some more variables. And partially that is what happens. The arguments of the `printData` indeed are destructed by creating an additional variable `_ref`. Then we simple use `_ref.<something>` to get an access to what we want. The extracting of the `name` is the same but the `age` variable is using a helper function `_slicedToArray`. I intentionally didn't prettify the implementation of `sliceIterator` because it is anyway difficult to understand and not so interesting. The reason behind this helper is that JavaScript may destruct everything that is iterable. Like for example strings. In order to support this we have a check asking "Is this an array?" and if yes then we just use the `array[<index>]` notation. If not we slice the iterator to an array so we can reference what we need by index.

The file size has changed from 220 to 992 bytes but `_slicedToArray` is probably used all over your code and it is defined only once so there is no much of impact for the final bundle.

## The awesome ES6 classes

For years the OOP in JavaScript was done using the prototype inheritance. Today we have classes and may write code like:

```js
class Person {
  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
  }
  fullName() {
    return this.firstName + ' ' + this.lastName;
  }
}

class User extends Person {
  greeting() {
    console.log('Hello, ' + this.fullName());
  }
}

var user = new User('John', 'Smith');
user.greeting(); // Hello, John Smith
```

This example illustrates class definition with a constructor and a public method. We also see inheritance using the `extends` keyword. These 340 bytes are transformed to a code containing couple of helpers:

```js
'use strict';

var _createClass = function () {
  function defineProperties(target, props) { ... };
}();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Person = function () {
  function Person(firstName, lastName) {
    _classCallCheck(this, Person);

    this.firstName = firstName;
    this.lastName = lastName;
  }

  _createClass(Person, [{
    key: 'fullName',
    value: function fullName() {
      return this.firstName + ' ' + this.lastName;
    }
  }]);

  return Person;
}();

var User = function (_Person) {
  _inherits(User, _Person);

  function User() {
    _classCallCheck(this, User);

    return _possibleConstructorReturn(this, (User.__proto__ || Object.getPrototypeOf(User)).apply(this, arguments));
  }

  _createClass(User, [{
    key: 'greeting',
    value: function greeting() {
      console.log('Hello, ' + this.fullName());
    }
  }]);

  return User;
}(Person);

var user = new User('John', 'Smith');

user.greeting();
```

## The magic of `async` and `await`