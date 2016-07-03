# Naming, naming, naming ...

I'm *writing code* for approximately ten years now and at some point the word "writing" became more important then "code". I found out that it is easy to *generate* code but it is difficult to *write* code. *Writing* means creating something meaningful. Something that other human beings will read. The code is indeed sent to machines and they do understand ugly code. Not the same for humans though. An important part of our job is to make sure that our code is clear for other teammates.

I wrote [three books](http://krasimirtsonev.com/#books) and I could say that finding the right words is always challenging. We write all day long so we (the developers) are more or less writers. And it is damn hard being a good writer. Of course with engineering we don't have to make stories but finding a good phrasing is still a problem. Even in programming, one of the most difficult things is picking the right words - the *naming*. How to name the tags in our markup, how to name the variables and functions in our JavaScript or how to name our CSS classes.

Let's see how this problem exists in the context of front-end development.

## In HTML

When we are talking about naming in HTML we probably mean [HTML semantics](https://en.wikipedia.org/wiki/Semantic_HTML). The HTML tags are not only structuring the page but they also have meaning. HTML as a language evolved during the years. In the beginning was more about the presentation of the page but later we changed that. For example the `<b>` tag was well known as something that bolds the text placed inside. However, with the [HTML5 specification](https://www.w3.org/TR/html5/text-level-semantics.html#the-b-element) we now put some semantic meaning to it:

> The b element represents a span of text to which attention is being drawn for utilitarian purposes without conveying any extra importance and with no implication of an alternate voice or mood, such as key words in a document abstract, product names in a review, actionable words in interactive text-driven software, or an article lede.

Most of the tags in HTML mean something. If we are build a navigation we better use `<nav>` instead of `<div>` because the `<div>` has no any meaning.

As opposed to CSS and JavaScript, HTML has a limited amount of *words* (I'm excluding the fact that we may create our own custom tags). This means that the problem with the naming is easily solvable. As long as we know the meaning of the tags we are in a good position. The rules that we are following while writing semantic HTML are pretty concrete. For example we can't use `<header>` tag for our footer section. If we want to display an unordered list we use `<ul>` along with `<li>` tags and not `<div>` along with series of `<p>` tags.

On of the characteristics of the good naming is whether a newbie understands the code quickly. And by *understands* we mean knows what the code is doing and is confident enough to make changes. In that sense, HTML with not so good naming doesn't drastically affect the understanding of the markup. For sure it's easier if there are fewer tags and if they come with specific meaning.

A good HTML semantics make our application more accessible. This is nowadays important because we are aiming more and more people with more and more devices. A proper naming of our HTML markup may significantly increase the value of our products.

## In CSS

Finding the right naming in CSS is definitely harder. Let's for example say that we need to add a top border to our `<section>` tag.

* Shall we describe what the style is bringing to the page. If we use a [`::before` pseudo element](http://krasimirtsonev.com/blog/article/CSS-before-and-after-pseudo-elements-in-practice) and we change the structure of the markup we may end up with `.sectionBorder`.
* Shall we describe how the element will look like after applying the style. For example, instead of saying `.sectionBorder` shall we say `.borderedSection`.
* Shall we describe an action like `.hide` for example or in this case `.addSectionBorder`.
* Or maybe we should ask a question - `.isBorderedSection`

First, there are these personal preferences. Some developers have their own vision of how the classes should be phrased. Very often we name stuff based on our personal feelings. There is no wrong or right. As long as we define how it should be and the whole team is following same principles the naming is correct.

If the team can't decide how to approach the problem then there are already defined name conventions. Like for example [SMACSS](https://smacss.com/), [BEM](http://getbem.com/introduction/) or [SUIT](http://suitcss.github.io/). All these conventions are around the idea of separating the responsibilities. Having grid system classes, typography and color classes, application specific classes or utility styles.

I'm personally fen of granularity in CSS. What I mean by that is defining lots of small classes and use a composition to achieve the desired result. If we go back to our `<section>` tag and its top border styling:

```
// in CSS
.sectionBorder {  
  padding-top: 0.4rem;
  border-top: 2px solid #BADA55;
}

// in HTML
<section class="sectionBorder"> ... </section>
```

Nothing wrong here but I would go with the following:

```
// in CSS
.u-pt {
  padding-top: 0.4rem;
}
.u-bc-brandColor {
  border-color: #BADA55;
}
.u-bt {
  border-style: solid;
  border-top-width: 2px;
}

// in HTML
<section class="u-pt u-bc-brandColor u-bt"> ... </section>
```
*(the `u` prefix comes from `utility`)*

I'm always searching for high reusability of the CSS classes. Of course there are cases where we need custom classes that can not be reused. And here is the challenge in this approach. We can't simply define a CSS class for every possible CSS property. The trick is finding what our application needs in terms of styles and create only those as atomic classes.

## In JavaScript

There are lots of [style guides](https://addyosmani.com/blog/javascript-style-guides-and-beautifiers/) available out there. What most of them define is how the code should look like. I.e. where to put the curly brackets or where to add (or not to add) spaces. The naming of code variables, objects, functions or classes is not strictly specified. Thankfully in JavaScript (similar to most programming languages) we have clear directions by default.


### Variables

For example the variables are meant to store data. We may ask "What kind of data this variable stores?". If we need keeping an information about accounts in our system we may use `users`. If part of the data is filtered this may change to `administrators`. However, it's not really good idea to use `info` or just `data` because this is not saying much. We should be as much specific as possible. I consider the too general naming of a variable as code smell. Think about the following example:

```
function isAdmin(data) {
  if (data) {
    data = data.permissions || [];
    return data.includes('level2') && data.includes('level3');
  }
  return false;
}
```

We pass the user's data to `isAdmin` and we expect `level2` and `level3` strings in the `permissions` array. I don't know about you but the code makes me read it twice. We first assume that `data` may be `undefined` so we use it as a boolean. Then if everything is ok we convert the `data` from an object to an array and work with that array (which by the way decrease the performance of the code). A better approach here could be:

```
function isAdmin(user) {
  if (typeof user !== 'undefined') {
    let { permissions = [] } = user;
    return permissions.includes('level2') && permissions.includes('level3');
  }
  return false;
}
```

We have clear separation between `user` and his/her `permissions`.

### Functions and methods

While the variables are for storing data the functions (or methods) are about changing/processing that data. It's again good to be as specific as possible and the question that we usually ask is "What is that function/method doing?". As an addition to that I prefer giving a hint for the output, the result after execution. For example if we have a function that mutates our application state we may first say `transformData` but then change it to `getTransformedData`. That way we are not only saying what the function is doing but also what it returns.

Using a verb in the name of our functions has another impact. It forces us writing single-job methods. If we are parsing and saving in one place then we may think about `parseAndStoreUserData`. We immediately see that these two tasks could be split into two different functions. Searching for better naming improves our code before even having the code written down.

### Classes

As opposite to functions and methods I don't like using verbs while defining classes. To be honest it's actually difficult doing this. That's because the classes are kind of mixture between both worlds "What data stores and what it does with it?". If we have an utility class that checks if the user is an administrator we'll probably go with `UserCapabilities` and a method `isAdmin`. `UserChecking` or `CheckUserCapabilities` sounds odd.

A good class name is the one that brings context and suggests only one action. If the name sounds generic then the class is probably doing more stuff then expected.

## Conclusion

How we programmers name stuff in our scripts definitely matter. I would say that this is always difficult and it will be always difficult. What is important is to push for better naming because this will help us finding problems earlier. It will help us maintaining our applications. We shouldn't save words while writing code. Please don't use `ctrl` instead of `controller` or `v` instead of `view`. Let's be better writers (programmers)!
