# Unexpected usage of Array's length property

I like reading code of other developers. It's a nice way to learn patterns, techniques and small tricks. Recently I found something about `Array.prototype.length` which caught my attention.

We all know that while working with Arrays `.length` returns the number of the added items. For example:

```
var arr = ['a', 'b', 'c', 'd'];
arr.length; // 4
```

However, it turns out that `length` is not just a read-only property. We may set values to it. ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/length)) 

![Array.prototype.length](./mdn.jpg)

What happen if we have four elements in the array and we set length to five:

```
var arr = ['a', 'b', 'c', 'd'];
arr.length = 5;
arr; // ["a", "b", "c", "d", undefined]
```

~~We added one item at the end of the array. It's value is `undefined. We may set `length` to ten and we'll get six more `undefined` elements.~~ We are not actually adding a new element. We simply say that the value of `length` property of `arr` is 5. If we try looping with `forEach` we'll see that there is no additional element.

```
arr.forEach((item, i) => {
  console.log(i, typeof item);
});
// 0 "string"
// 1 "string"
// 2 "string"
// 3 "string"
```

However, if we use a `for` loop we'll get one more `undefined` at the end:

```
for(var i=0; i<arr.length; i++) {
  console.log(i, arr[i]);
}
// 0 "a"
// 1 "b"
// 2 "c"
// 3 "d"
// 4 undefined
```

And that's not because we added one more record but because there is nothing at `arr[4]`. *(Thanks to [&#352;ime Vidas](https://twitter.com/simevidas) for spotting this fact)*

The more interesting use case is decreasing the length or setting it to a number less then the actual elements' count. 

```
var arr = ['a', 'b', 'c', 'd'];
arr.length -= 1;
arr; // ["a", "b", "c"]
```

We deleted the last element of the array. We may of course say `arr.length -= 3` and we'll end up with only one item `["a"]`. Yes, we have a `pop` method which also removes the latest record from the array but decreasing the length allow us erasing multiple elements.

Can we use the same technique to pull elements from the beginning of the array? The answer is yes. It's ugly but it is possible:

```
var arr = ['a', 'b', 'c', 'd'];
arr.reverse().length -= 2;
arr.reverse();
arr; // ["c", "d"]
```

Every string may be converted to an array right. Having the array we may apply the learned above to truncate the text at a given word. For example:

```
var str = 'Brown fox jump over the lazy dog';

function truncate (text, word) {
  var words = text.split(' ');
  var pos = words.indexOf(word);

  if (pos === -1) return text;
  words.length = pos;
  return words.join(' ') + ' ...';
}

truncate(str, 'over'); // Brown fox jump ...
truncate(str, 'nope'); // Brown fox jump over the lazy dog
```


