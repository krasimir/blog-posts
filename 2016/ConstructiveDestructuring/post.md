# Constructive destructuring

Destructing is one of my favorite ES6(ES2015) features. It just shortens my code and helps me be more explicit with my statements. Let's see it in action.

## The good old options-as-object case

We sometimes send so many arguments to particular function that we decide to group them in an object. For example:

```
function request(url, method, data, success, error, debug) {
  // ...
}

request(
  '/api/data'.
  'POST',
  { id: '...' },
  function (result) {},
  function (error) {},
  false
);
```

Not really nice isn't it. It's much nicer if we do the following:

```

```