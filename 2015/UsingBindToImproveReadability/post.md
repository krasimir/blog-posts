# A story about currying

I hope you know about [currying](https://en.wikipedia.org/wiki/Currying). If not then please read this [book](https://github.com/MostlyAdequate/mostly-adequate-guide). It's basically a process of calling a function with less parameters than it expects. Ok, not exactly *calling* the function but prepare another function that will run the original one. Some people call the returned function higher-order **factory** function. Really powerful concept.

## Creating our own currying helper

Let's see the following example:

```
var dictionaryA = {
  red: '#F00',
  green: '#0F0',
  blue: '#00F'
};
var dictionaryB = {
  small: '0.7em',
  mormal: '1em',
  big: '1.5em'
};
var read = function (dict, key) {
  return !!dict[key] ? dict[key] : false;
};

console.log('Blue color: ' + read(dictionaryA, 'blue'));
console.log('Big font size: ' + read(dictionaryB, 'big'));
```

We do have one level of abstractions so we don't have to check if our `key` exists in the dictionary. However, in the last two lines we expose the *knowledge* about the dictionaries. Wouldn't be cool if we hide that too and provide `readColors` and `readFontSizes` functions. Then we'll keep our data collections in one place and not spread them across all the application. Because that's what will happen if we need to read from them and have only the `read` method.

The first thing that we can do is:

```
var read = function (dict, key) {
  return !!dict[key] ? dict[key] : false;
};
var readColors = function (color) {
  return read(dictionaryA, color);
};
var readFontSizes = function (size) {
  return read(dictionaryB, size);
};
```

Not really nice because if we have another dictionary we have to create another helper. Currying to the rescue:

```
var curry = function (func, paramA) {
  return function (paramB) {
    return func(paramA, paramB);
  }
};
```

We say *"Please, give me a **curried** version of my `func` and use `paramA` as first argument."*. By using this technique we are able to write the following:

```
var dictionaryA = { ... };
var dictionaryB = { ... };

var curry = function (func, paramA) {
  return function (paramB) {
    return func(paramA, paramB);
  }
};
var read = function (dict, key) {
  return !!dict[key] ? dict[key] : false;
};
var readColor = curry(read, dictionaryA);
var readFontSize = curry(read, dictionaryB);

console.log('Blue color: ' + readColor('blue'));
console.log('Big font size: ' + readFontSize('big'));

```

Much much better because we may pass `readColor` or `readFontSize` to different parts of our system and they have no idea about dictionaries. We keep that *knowledge* about our data structure isolated.

## Using bind instead

[bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) could be used (partly) as a replacement of our `curry` helper. 

```
var dictionaryA = { ... };
var dictionaryB = { ... };
var read = function (dict, key) {
  return !!dict[key] ? dict[key] : false;
};
var readColor = read.bind(null, dictionaryA);
var readFontSize = read.bind(null, dictionaryB);

console.log('Blue color: ' + readColor('blue'));
console.log('Big font size: ' + readFontSize('big'));
```

`bind` is part of `Function.prototype` so we may call it on every JavaScript function. It accepts a scope (i.e. where `this` points to) and arguments that have to be passed to the function. So it's kind of one-level currying helper.

## Curry all the things

Once you start thinking about `bind` as a form of currying you simply can't stop using it. All we have to do is to see the pattern. For example, very often we need to apply a class to DOM element and then remove it.

```
button.setAttribute('disabled', 'disabled');
// At some point later we have to
// active the button so we remove the class
button.removeAttribute('disabled');
```

So to disable/enable buttons we have to know two things - the actual DOM element and the name of the attribute. What if we go with currying that process:

```
var disableButton = button.setAttribute.bind(button, 'disabled', 'disabled');
var enableButton = button.removeAttribute.bind(button, 'disabled');

...

disableButton();
// At some point later we have to
// active the button so we call enableButton
enableButton();
```

Much simpler isn't it!
