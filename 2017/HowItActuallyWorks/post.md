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

## The awesome ES6 classes

## The magic of `async` and `await`