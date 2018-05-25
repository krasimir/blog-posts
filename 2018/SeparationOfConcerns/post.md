# React and separation of concerns

Years ago when Facebook announced their JSX syntax we had a wave of comments how this is against some of the well established good practices. The main point of most people was that it violates the separation of concerns. They said that React and its JSX are mixing HTML, CSS and JavaScript which were suppose to be separated.

In this article we will see how React and its ecosystem has quite good separation of concerns. We will prove that markup, styles and logic may live in the same JavaScript land and still be separated.

## Styling

React components render to DOM elements. Nothing stops us to use the good old `class` attribute and attach a CSS class to the produced HTML element. The only difference is that the attribute is called `className` instead of `class`. The rest still works which means that if we want we may put our styles into external `.css` files. It is clear that following this approach we are not breaking the separation of concerns principle.

```js
// assets/css/styles.css
.pageTitle {
  color: pink;
}

// assets/js/app.js
function PageTitle({ text }) {
  return <h1 className='pageTitle'>{ text }</h1>;
}
```

The "problem" became a problem when [developers](https://vimeo.com/116209150) started talking about "CSS in JavaScript". Back in 2014 this looked weird and wrong. However, the next couple of years showed that this is not the case.