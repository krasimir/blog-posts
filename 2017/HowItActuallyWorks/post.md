If you write JavaScript today you probably use some sort of a transpilation tool. A tool that reads your hipster code and convert it to code that works in the browser. In this article we are going to see what is actually send to the browser and how exactly libraries like [Babel](https://babeljs.io/) polyfill some of the ES6 features.

It is also interesting on what price. Some of the syntax like async/await may be a little bit expensive. I mean as a file size. But let's start with something simple - the arrow function.

## The `this` problem

I started writing JavaScript after several years of ActionScript and PHP programming. I used these both languages a lot and they both had (still have) classes. Back then in JavaScript we had to use prototype based inheritance to achieve some of the OOP principles. And because the functions in JavaScript are first class citizens and they define a new scope we had to use the word `this` a lot. The problem was that `this` is not always pointing to what we want and we end up defining variables like `that` or `self`. Years later we got the arrow function definition and it seems that the problems slowly goes away. Here is a small example:

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

We defined a *class* `Person` and inside the constructor there is `getProperName` that produces a nice name like `Mr. John Smith`. That is fine but the code above does not work because we are using `this` in a context which has no `firstName` and `lastName`. The arrow function definition is a perfect solution for this problem:

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

The transpiler probably knows what `() => {` means and simply translate it to a `function` definition. But what about the `this` keyword. Here is how the code looks like:

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

If we compare the file size of the two snippets we will see just 41 bytes difference.

## Template literal

Today I am convinced that the ES6 template literals are just a better way to work with strings in JavaScript. I was thinking about how Babel for example is polyfilling that feature. It seems easy right - a simple concatenation:

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

However, the [tagged template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals) are completely different story. Let's consider the following code:

```js
const censor = function (strings, name) {
  return strings[0] + name.charAt(0) + '...' + strings[1];
}
const greeting = function(name) {
  return censor`Hello ${ name },\nHow are you?`;
}

// Outputs:
/* 
  Hello J...,
  How are you?
*/
greeting('John Smith');
```

The idea is that we display just the first letter of the person's name. The rest is just replaced with three dots. Now, let's see how this code may work in a browser that does not support template literals.

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
var greeting = function greeting(name) {
  return censor(_templateObject, name);
};

greeting('John Smith');
```

The `censor` method stays untouched and the place where we defined the tagged template literal is now a simple function call of exactly that `censor` function. However we now have some additional code that prepares the `strings` array. By specification the first argument of the tagging method is an array of strings. The remaining arguments are related to the expressions. That first array object has also a `raw` property that is again the same array of strings but their un-escaping versions. The `_taggedTemplateLiteral` helper is there to ensure that we receive an object that can't be modified (the usage of `Object.freeze`) and has a `raw` property.

What happens if we add another template literal is that we got a new `_templateObject` definition. Then `_taggedTemplateLiteral` is getting used again and again because it is data agnostic. The difference between original and transpiled code in file size is 261 bytes. Let's continue with another ES6 feature - destructing.

## Destructuring

Destructuring is one of my favorite features. I'm using it wherever possible because it removes some boilerplate and very often eliminates naming problems. Here is an example:

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

Now this gets interesting. To be honest I thought that the polyfill of a destructing statement is just creating a bunch of additional variables. And I am partially right. The arguments of the `printData` function are indeed destructed by creating an additional variable `_ref`. Then we simple use `_ref.<something>` to get an access to what we want. The extracting of the `name` is the same but the `age` variable is using a helper function `_slicedToArray`. I intentionally didn't prettify the implementation of `sliceIterator` because it is anyway difficult to understand and not so important. The reason behind this helper is that JavaScript may destruct everything that is iterable. Like for example strings. In order to support this we have a check asking "Is this an array?" and if yes then we just use the `array[<index>]` notation. If not we convert the iterable variable down to an array so we can reference what we need by index.

The file size here has changed from 220 to 992 bytes but `_slicedToArray` is probably used all over our code and it is defined only once so there is no much of impact for the final bundle.

Some of the features that we saw so far seems simple but their polyfill actually requires a lot of work. Let's see what is required for the class definitions.

## The awesome ES6 classes

For years the OOP in JavaScript was done using the prototype inheritance. Today we have classes and may write code like this:

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

This example illustrates class definition with a constructor and a public method. We also see inheritance using the `extends` keyword. Most of the common classes features are here. Let's see how to transpile this:

```js
var _createClass = function () {
  function defineProperties(target, props) { ... };
}();
function _possibleConstructorReturn(self, call) { ... }
function _inherits(subClass, superClass) { ... }
function _classCallCheck(instance, Constructor) { ... }

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

    return _possibleConstructorReturn(
      this, (User.__proto__ || Object.getPrototypeOf(User)
    ).apply(this, arguments));
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

Lots of stuff happening and I didn't even add the code of the helpers. Let's start reading from the `Person` class. We know that ES6 classes are not quite here yet and in order to provide the same functionality we have to rely on the good old JavaScript function and prototype chaining. So `Person` (and `User`) are transpiled to functions.

```js
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

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
```

The constructor of `Person` still registers `firstName` and `lastName` but we have a call of `_classCallCheck`. This little helper ensures that we always use our definition with a `new` keyword. Or in other words, we always create new instances and not just calling the constructor as a regular function.

Then we have the actual class abstractions done via the `_createClass` method. It accepts the constructor (`target`) and a list of methods definitions (`props`).

```js
var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
```

`_createClass` is attaching methods to the prototype of the constructor and if there are static properties to the actual constructor by using the `Object.defineProperty` API. It accepts some settings of the actual object property like `enumerable`, `configurable` and `writable` but otherwise it looks like the old prototype based OOP.

The `User` class definition uses the same helpers plus other two ones. For inheritance there is `_inherits` and for calling the super class constructor `_possibleConstructorReturn`:

```js
var User = function (_Person) {
  _inherits(User, _Person);

  function User() {
    _classCallCheck(this, User);

    return _possibleConstructorReturn(
      this, (User.__proto__ || Object.getPrototypeOf(User)
    ).apply(this, arguments));
  }

  _createClass(User, [{
    key: 'greeting',
    value: function greeting() {
      console.log('Hello, ' + this.fullName());
    }
  }]);

  return User;
}(Person);
```

Let's dig into the inheritance first:

```js
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(
    superClass && superClass.prototype,
    {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    }
  );
  if (superClass)
    Object.setPrototypeOf ?
      Object.setPrototypeOf(subClass, superClass) :
      subClass.__proto__ = superClass; 
}
```

The function starts with a check if we passed a function or `null` as a super class. A string for example will not work and does not make any sense. A big role here plays the `Object.create` API. That's how we update the prototype to match the super class's prototype. At the end we set the internal `[[Prototype]]` property of the sub class by using (if available) the `Object.setPrototypeOf` method. The inheritance is done again the same way as we were doing it years ago - applying the prototype of one object to another.

To make the extending works the transpiler asks about the super class constructor via the `_possibleConstructorReturn` function. Then it fires it with the given arguments. The same helper is used if we create our own constructor and run the `super()` function.

```js
function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === "object" || typeof call === "function") ? call : self;
}
```

As we can see transpiling ES6 classes is not an easy job at all. Together with the basic inheritance we have to cover some edge cases which make the task tricky. It is interesting how everything so far goes back to the roots of the languages and can be expressed by using simpler JavaScript features. Which kinda proves that learning the basics is always helpful.

The difference in file size here is 1860 bytes.

## Conclusion

Most of us probably don't think about transpilers and how difficult is to write one. In this article we saw just a small fraction of what Babel for example is doing. We didn't touch areas like async-await or generators where I believe it gets even more complicated. And that is just one side of the coin. Before implementing the polyfill there is parsing of invalid JavaScript and converting it to an AST that makes sense. Then this AST gets modified so it contains the polyfill instead of the invalid snippets. Having a syntax tree that contains valid code declarations means that we may produce the final version that gets shipped to production. In other words, if you ever see someone that contributes to a transpiler buy him/her a beer :)