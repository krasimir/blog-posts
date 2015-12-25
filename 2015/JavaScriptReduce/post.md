# JavaScript's reduce could be really helpful

I love using functions like `map`, `filter` or `reduce`. They are an important part of my arsenal and I simply can't stop using them. Today I had to solve an interesting problem and I ended up using `reduce`.

## The task

I was writing a test for [Navigo](https://github.com/krasimir/navigo) and I had to check if a specific helper function works as expected. It's called `getRoot` and its signature is as follows:

```
function getRoot(url, patterns = []) { ... }
```

So the purpose of the test was to attack the function with different URLs with a combination with different patterns. And because the actual assertions will be the same I decided to define my cases in an array and loop through them.

```
const cases = [
  { 
    source: 'http://site.com/',
    expected: 'http://site.com',
    patterns: []
  },
  ...
];

describe('Given the getRoot helper', function () {
  cases.forEach(testCase => {
    describe(`when passing ${testCase.source} with patterns ${testCase.patterns.join(', ')}`, () => {
        it(`should return ${testCase.expected}`, () => {
          expect(getRoot(testCase.source, testCase.patterns)).to.be.equal(testCase.expected);
        });
      });
  });
});
```

Everything was going fine. I was adding more and more test cases. However, at some point I wanted to run only one of them. And because I was being "smart" I now can't use `describe.only` because I'm generating those `describe` calls. It makes sense that we add `only: true` to the specific case and we see only one test running. For example:

```
const cases = [
  { 
    source: 'http://site.com/',
    expected: 'http://site.com',
    patterns: []
  },
  { 
    source: 'http://site.com',
    expected: 'http://site.com',
    patterns: [],
    only: true // <----
  },
  { 
    source: 'https://site.com/',
    expected: 'https://site.com',
    patterns: []
  },
  ...
}
```

First, I was thinking using `filter` and excluding those cases where we don't have `only: true`. However, this approach doesn't work in the scenario where I run all the tests because none of the items in the array have `only` as a property.

I ended up using `reduce`. According to [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce):

> The reduce() method applies a function against an accumulator and each value of the array (from left-to-right) to reduce it to a single value.

Or in other words, we may convert the array to something else by iterating over all the elements. There are set of rules based on which we have to implement the solution:

* If there is no `only: true` set then we return all the elements
* If there is `only: true` then we return an array with one element
* There could be only one element with `only: true`

## The solution

`reduce` accepts two parameters - the first one is a callback that will be run against every element and the second one is an initial value. For example:

```
var arr = [1, 2, 3];
var result = arr.reduce((sum, current, index, arr) => {
  sum += current;
  return sum;
}, 100);
console.log(result); // outputs 106
```

The snippet uses `100` as a starting point and adds to it every of the elements in the array.

My experience with `reduce` shows me that it is good to have a [pure function](https://en.wikipedia.org/wiki/Pure_function) as a callback. Which means that we can't have an external variable to store state while looping through the test cases. And we need such state because we have to know if `only: true` exists or not. If yes then we should return an array with only one element.

And here is the answer:

```
cases
  .reduce((state, current) => {
    if (!state.onlyOne) {
      state.all.push(current);
      if (current.only === true) {
        state.onlyOne = true;
        state.all = [ current ];
      }
    }
    return state;
  }, { all: [], onlyOne: false })
  .all
  .forEach(testCase => {
    describe(`when passing ${testCase.source} with patterns ${testCase.patterns.join(', ')}`, () => {
      it(`should return ${testCase.expected}`, () => {
        expect(getRoot(testCase.source, testCase.patterns)).to.be.equal(testCase.expected);
      });
    });
  });
```

The initial value is `{ all: [], onlyOne: false }` where `all` keeps the test cases which should be run and `onlyOne` tells us if some of the elements contains `only: true`. The important bit is

```
if (current.only === true) {
  state.onlyOne = true;
  state.all = [ current ];
}
```

where we fulfill the result with only one test case and make sure that `state.all.push(current)` will not be reached anymore.






















