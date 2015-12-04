# Enforce standards while submitting a pull request

[GitHub's pull requests](https://help.github.com/articles/using-pull-requests/) are an important part of my/[our](http://trialreach.com/) development process. That's why I was thinking about creating a template that will enforce the standards.

My goal is to fill the pull request's textarea with a predefined template. Ideally, when we open a PR we will start filling sections and not trying to remember what has to be added. Unfortunately GitHub doesn't offer such functionality. There is no way to define a template for pull requests. So I ended up by using a [bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet). A small piece of JavaScript that will be run in the context of the GitHub's page.

## How to write and use bookmarklet

Bookmarklets are actually bookmarks that point to a JavaScript code. For example:

```
<a href="javascript:alert(location.href);">
  Drag me to your bookmarks toolbar
</a>
```

If we drag the link to our browser's toolbar it will become a normal bookmark. Once we click it we'll get the location of the current page. So, the writing of bookmarklet means writing one line JavaScript that we place in a link. Installing the bookmarklet is dragging the link to our bookmarks toolbar.

Pretty powerful technique which I used for creating a pull request template.

## The template

What I want in the end is to populate the GitHub's textarea with the following:

```
# Ticket

# Task/Problem

# Solution

# Steps to reproduce

# UAT steps:

# Code review

- [ ] Unit tests passed
- [ ] System tests passed
```

And here is the JavaScript:

```
(function(){
  var textareaId = '#pull_request_body';
  var textarea = document.querySelector(textareaId);
  var template = '';
  var firstLine;

  template += firstLine = 'Ticket: ';
  template += '\n\n';
  template += '## Task/Problem\n\n';
  template += '## Solution\n\n';
  template += '## Steps to reproduce\n\n';
  template += '## UAT\n\n';
  template += '## Code review\n\n\n';
  template += '- [ ] Unit tests passed\n';
  template += '- [ ] System tests passed\n';

  if (textarea) {
    textarea.value = template;
    textarea.focus();
    textarea.scrollTop = 0;
    textarea.selectionStart = textarea.selectionEnd = firstLine.length;
  } else {
    alert('You are either not on the PR page or there is no ' + textareaId + ' element.');
  }
})();
```

The textarea of the pull request in GitHub has a `pull_request_body` as an id. Yes, you are right. If GitHub decides to change its markup then our bookmarklet will be broken. Unfortunately that's something that we have to live with.

`textarea.value = template;` is the place where we set the template. After that there are three lines of code that provide a little bit better developer experience. We bring the focus to the textarea, we scroll it to the top and place the cursor after `Ticket:` so we may start writing the PR directly. Without the need of clicking somewhere.

The bookmarklet is ready but it's not a one liner. Let's use [uglifyjs](https://github.com/mishoo/UglifyJS) for that.

```
npm install uglify-js@1 -g
uglifyjs ./src/Pull_request_template.js > Pull_request_template.min.js
```
The minified code can not be used directly in the HTML page because it may contain quotes. For example:

```
<a href="javascript: (function(){var a = "test"})()">drag me</a>
```

This will not work because the content of the `href` attribute is wrapped in double quotes and our bookmarklet contains double quotes too. So we need one more step to clean our JavaScript by replacing `"` with `'` (single quotes). I created a small repository for displaying bookmarklets and there is a function that does this job:

```
var filter = function (content) {
  return content
    .replace(/"/g, "'")
    .replace(/\n/g, '');
};
```





