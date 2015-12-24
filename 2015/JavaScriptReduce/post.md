# JavaScript's reduce could be really helpful

I love using functions like `map`, `filter` or `reduce`. They are an important part of my arsenal and simply can't stop using them. Today I had to solve an interesting task and I ended up using `reduce`.

I was writing a test for [Navigo](https://github.com/krasimir/navigo) and I had to check if a specific helper function works as expected. It's called `getRoot` and its signature is as follows:

```
function getRoot(url, patterns = []) { ... }
```

So the purpose of the test was to attack the function with different URLs with a combination with different patterns. And because the actual assertions will be the same I decided to define my cases in an array and look through them.

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

Everything was going fine. I was adding more and more test cases. However, at some point I wanted to run only one of them. And because I tried being "smart" I know can't use `describe.only` because I'm generating those `describe` calls. It makes sense that we add `only: true` to the specific case and we see only one test running.