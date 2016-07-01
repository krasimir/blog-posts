# Naming, naming, naming

At some point of your engineer career the word "writing" will become more important then "code". It's easy to *generate* code but it's difficult to *write* code. *Writing* means creating something meaningful. Something that will be read by other developers.

I wrote [three-ish books](http://krasimirtsonev.com/#books) and I could say that finding the right words is challenging. We (the developers) are more or less writers. And as you know it's damn hard being a good writer. With engineering is a little bit easy because we don't have to make stories but finding the right words is still a problem. This leads us to the conclusion that one of the most difficult things in programming is *naming*. How to name the tags in my markup, how to name the variables and functions in my JavaScript or how to name my CSS classes or IDs. We very often say "writing code". Let's see how this problem exists in the context of front-end development.

## HTML

When we talk about naming in HTML we basically mean [HTML semantics](https://en.wikipedia.org/wiki/Semantic_HTML). Or in other words, the tags are not only about the structure of the markup but they also have meaning. HTML as a language evolved during the years and I could say that in the beginning was more about the presentation of the page. For example the `<b>` tag was well known as something that bolds the text placed inside. However, with the [HTML5 specification](https://www.w3.org/TR/html5/text-level-semantics.html#the-b-element) we now put some semantic meaning to it:

> The b element represents a span of text to which attention is being drawn for utilitarian purposes without conveying any extra importance and with no implication of an alternate voice or mood, such as key words in a document abstract, product names in a review, actionable words in interactive text-driven software, or an article lede.

Most of the tags in HTML mean something. Which means that if we are build a navigation we better use `<nav>` instead of `<div>` because the `<div>` has no any meaning.

As opposed to CSS and JavaScript, HTML has a limited amount of words that we may use (I'm excluding the fact that we may create our own custom tags). This means that the problem with the naming is easily solvable. As long as we know the meaning of the tags we are in a good position. The rules that we following writing semantic HTML are pretty concrete. For example we can't use `<header>` tag for our footer section. If we want to display an unordered list we use `<ul>` along with `<li>` tags and not `<div>` along with series of `<p>` tags.

On of the characteristics of the good naming is whether a newbie understands the code quickly. And by *understands* we mean knows what the code is doing and is confident enough to make changes. In that sense, HTML with not so good naming doesn't drastically affect the understanding of the markup. For sure it's easier if there are fewer tags and they come with specific meaning.
