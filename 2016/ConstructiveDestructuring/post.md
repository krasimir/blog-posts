# Constructive destructuring

destructuring is one of my favorite ES6(ES2015) features. It just shortens my code and helps me be more explicit with my statements. Let's see it in action.

## What's destructuring assignment

destructuring assignment is a new syntax that allows us extract needed information from objects or arrays. We mimic the creation of those. For example:

```
var data = { question: '...', answer: 42 };
var { answer } = data; // answer = 42

var list = ['A', 'B', 'C'];
var [ first ] = list; // first = A
```

The idea is that we specify what portion of the object/array is assigned to the variables on the left side. Apparently this is a really powerful feature.

## The good old options-as-object case

Sometimes we store our data in an object literal. That object travels through our functions and we use what we need from it. Not everything but just a specific properties.

```
function showList(options) {
  var enabled = options.enabled;
  return options.files.forEach(function (file) {
    if (enabled) {
      // ...
    }
  });
}
```

Let's say that `options` contains the whole configuration of our application but we are interested only in `enabled` and `files`. And instead of writing `var prop = options.prop` every time we may use destructuring directly in the definition of the function:

```
function showList({ enabled, files }) {
  return files.forEach(function (file) {
    if (enabled) {
      // ...
    }
  });
}
```

The body of the function now becomes simple and easy to read.

## Better naming and default values

There are couple of other features that may come handy if we need better naming. We may give another name to the newly created variable while destructuring.

```
function showList({ enabled: isReady, files: attachments }) {
  return attachments.forEach(function (file) {
    if (isReady) {
      // ...
    }
  });
}
```

There are cases where the properties of the object are just too generic. And using an alias makes total sense. Like in the snippet above we have the knowledge that `enabled` means that *component is ready* but that is not clear by just reading the function. So *renaming* `enabled` to `isReady` clarifies what stands behind that boolean.

We may use default values while destructuring too:

```
function showList({ enabled: isReady, files: attachments = []}) {
  return attachments.forEach(function (file) {
    if (isReady) {
      // ...
    }
  });
}
```

## Give me all but not ...

Recently I was working with fat object containing lots of properties. And the thing was that I used the same object to perform a HTTP request. However, some of the fields should be removed before submitting. Otherwise I end up sending unnecessary data over the wire. Let's say that the object below is my POST data.

```
var data = {
  username: 'Joe',
  userId: 34,
  sectionTitle: 'Attachments',
  accessTo: ['section1', 'section2']
}
```

Because of some bad design decisions which I've made I now have the `username` and `userId` together with the data that should be saved in the database. Instead of creating a brand new object literal and writing something like `newObj.sectionTitle = data.sectionTitle` we may use destructuring:

```
var { username, userId, ...dataToSend } = data;
```

And indeed `dataToSend` contains only `sectionTitle` and `accessTo`.

## Working with arrays

So far we saw examples using objects. Well, the same feature works for arrays too. In the beginning of the article we saw how to extract the first element of an array:

```
var list = ['A', 'B', 'C'];
var [ first ] = list; // first = A
```

It's possible to use the [spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator) to cut of the array and get everything but not the first two items:

```
var list = ['A', 'B', 'C', 'D'];
var [ first, second, ...other ] = list;

// other = ['C', 'D']
```

I like using destructuring when accessing DOM nodes with `document.querySelectorAll`. Very often I know exactly how many elements I'm querying and their order. Having this knowledge I'm able to define variables in just one line:

```
var [ username, password ] = Array.from(document.querySelectorAll('input'));

// we need Array.from because querySelector returns
// a non-iterable object
```

## The unknown property

At the end, one use case which is not so popular but but it's still quite interesting. What if we have an object and we are interested in one of its properties but we don't really know the name of it. We have it in a variable:

```
// we have the weird property name in a variable
var id = 'A34fG33a21';

var data = {
  'A34fG33a21': 'destructuring is cool'
}
var { [id]: fact } = data;
console.log(fact); // outputs "destructuring is cool"
```

## Summary

destructuring may seem like a syntax sugar but I think it's a nice way to simplify the code and get rid of all those temporary variables and statements that we have to write. So, use it wisely and happy destructuring" :)

*A good resource for the destructung assignment is [MDN page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment). So make sure to read that as well.*