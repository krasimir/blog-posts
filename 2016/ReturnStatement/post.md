# The return statement is not the end (but should be)

Well, I kind of lied in the title of this article. Of course that it is the end of the function. Once we call `return` everything else after that is simply not executed. Ops ... I did it again, I kind of lied again.

I was browsing some Babel [code](https://github.com/babel/babel/blob/master/packages/babel-helper-builder-react-jsx/src/index.js) and I noticed something like that:

```
function doSomething (a, b) {
  var result = format(a + b);
  
  return result;

  function format(n) {
    return 'Result is: ' + n;
  }

}
```

Notice how we use the `format` function before calling `return` but its definition is after that. This is possible because of the JavaScript [hoisting](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var#var_hoisting). It is important to define the function like `function name` (function declaration) and not `var name = function` (function expression). The following code for example doesn't work:

```
function doSomething (a, b) {
  var result = format(a + b);
  
  return result;

  var format = function(n) {
    return 'Result is: ' + n;
  }

}
```

We get `Uncaught TypeError: format is not a function` error. When we use function expression the defined variable is indeed hoisted but its value not. Consider we have another snippet:

```
function doSomething () {
  console.log(format, nothing);
  
  return result;

  var format = function() {
    return 'Hello world';
  }
}
```

If we run it we'll get `ReferenceError: nothing is not defined` because format is hoisted. Yes, its value is `undefined` but it is defined in the scope of the current function.

So, why we are talking about this stuff. Well, I think using function declaration after the return statement makes the code difficult to understand. We have to jump back and forth in the function's body to understand what is going on. We read from top to bottom (normally) so it makes sense to see something defined and then used. Can this be considered as a anti-pattern?








