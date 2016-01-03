# Deep dive into client-side routing

<small>*(This blog post is inspired by [A modern JavaScript router in 100 lines](http://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url) and heavily related to [Navigo](http://work.krasimirtsonev.com/git/navigo/) router project)*</small>

If you build single page applications you probably know that one of the must-have parts is the router. The bit that knows how to tweak the content of the address bar and notifies the rest of the system for URL changes. In this article we will discuss the various aspects of the routing in the browser.

## The client-side routing is not a new thing

I used to develop [Flash](http://www.adobe.com/en/products/flash.html) based applications back in the days. The biggest problem was the fact that they run in a plugin, in a black box. So, the browser is not aware of the changes that happen inside. And again we had different pages, we had to keep state and all these stuff which we now write with JavaScript. To make the project browseable from the outside we used a technique called *deep linking*. I even blog about that, [five years ago](http://krasimirtsonev.com/blog/article/deep-linking-in-flash-with-as3-and-javascript). There is a library [SWFAddress](http://www.asual.com/swfaddress/) which was used everywhere and all companies adopted the idea. Even Adobe. The funny thing is that today, five years later, we have to do the same thing. If we have to support IE9 and below we have to use the same hash based routing.

## Hash-based routing

What we meant by hash-based routing is using the anchor part of the URL to simulate different content. For example `http://site.com/#/products/list` leads to displaying a list of products. We have to mention that the `#/products/list` bit is never sent to the server. and we are completely operating in the client-side. The routing is possible because changes in the hash don't trigger page reload.

### Reading the route

To read the anchor bit from the URL we may use the following code:

```
var hash = window.location.hash;

// or extracting the hash from the entire URL
var hash = window.location.href.split('#')[1] || '';
```

The rest is applying a regular expression against the string and mapping the result to a handler. We will see how this works in the next sections.

### Changing the path

As we mentioned above changing only the hash doesn't reload the page. The following helper will update the URL without firing a new request:

```
var navigate = function (path) {
  var current = window.location.href;
  window.location.href = current.replace(/#(.*)$/, '') + '#' + path;
}
```

### Subscribing for changes

Knowing the URL and having a function for updating it is not enough. The URL could be changed by using the navigation buttons of the browser. For example clicking on the *back* or *forward* button. In the past the only one way to catch those cases was to call a function at given time-interval. For example:

```
var url = null;
var getCurrent = function () {
  return window.location.hash;
};
var listen = function () {
  var current = getCurrent();
  if (current !== url) {
    console.log('URL changed to ' + current);
    url = current;
  }
  setTimeout(listen, 200);
};
listen();
```

For several years code like the one above helped us producing shareable URLs. Even then was possible to create an app that lives entirely in the browser but still has different pages.

Then something else happen, a new API was introduced - [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API). 

## A routing revolution with pushState

We have a `window.history` object which provides several methods for manipulating the history of the browser. We have for example `window.history.back()` for moving a step back or `window.history.forward()` to do the opposite. More interestingly there is [`window.history.pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) method:

```
var stateObj = { foo: "bar" };
history.pushState(stateObj, "page 2", "bar.html");
```

That's how we create a new entry in the history of the browser. In the snippet above we pass a state, title (which is ignored by some browsers) and an URL. The browser immediately replaces the current URL with the provided one. If we later go back to the same entry a [`popstate`](https://developer.mozilla.org/en-US/docs/Web/Events/popstate) event is fired where we may fetch the state object.

```
window.onpopstate = function (event) {
  console.log('state: ' + JSON.stringify(event.state));
};
```

The effect of `pushState` is indeed really cool but it comes with a price. To use this method for routing we need to make some changes in the server that hosts our app.

## Client-side routing is not exactly only client-side

Client-side routing means using JavaScript to switch the pages in our application. It's tempting because we don't have to send a request to the server. The whole process happen in the same session. However, this is kind of problematic if we don't have an access to the server and its configuration. Or at least some option to forward requests.

If we shift the routing to the front-end then we should have all the request landing in one place. Otherwise we have to create a HTML file for every single route. 

```
                                  ----- server ------
              http://site.com --> |                 | 
                                  |   /index.html   |
                   index.html <-- |                 |
                                  -------------------

                                  ----- server ------
http://site.com/products/list --> |                 | 
                                  |   /index.html   |
           404 page not found <-- |                 |
                                  -------------------

```

We know that most servers open `index.html` file if physically exists at the requested path. In the image above we requested `http://site.com` and we receive `/index.html`. Let's say that at some point we click on a link and we use the History API to change the URL with `http://site.com/products/list`. We update the content of the page and everything seems ok. The problem is that if we refresh the browser or copy and paste the new URL we'll get nothing (probably 404 page not found error). It's like that because there is no (physically) `/products/list/index.html` file on the server. 

The problem could be solved if we amend the configuration of the server and forward all the requests to the same `index.html` file. JavaScript has an access to the current page's URL so we may resolve the path and map it to some logic in our app. 

If we use [Apache](https://httpd.apache.org/) as a server we may [easily use a `.htaccess`](http://krasimirtsonev.com/blog/article/apache-htaccess-for-html5-push-state-manipulations) file:

```
<ifModule mod_rewrite.c>
  Options +FollowSymLinks
  IndexIgnore */*
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule (.*) index.html
</ifModule>
```

If we use hash based routing we may leave our server untouched though. Very often the routers in JavaScript take this way because the History API is [not supported](http://caniuse.com/#search=pushState) in IE9 and below.

## Navigo - my exercice router implementation

It took me several months to wrap my experience about client-side routing in a library format. Not because it's so complicated but because I didn't have enough time ... and of course I've been lazy. [Navigo](http://work.krasimirtsonev.com/git/navigo/) is a client-side router that uses the History API by default but fallbacks to hash based routing in older browsers. I'll not describe the whole process here but will mention a few tricky parts.

### Regular expressions

In the beginning it looked easy because I converted the passed route string to a RegExp object and try matching it with the current URL.

```
var url = 'http://site.com/users/list';
var route = '/users/list';
var r = new RegExp(route);
var match = url.match(r);
```

However, I decided to use TDD for this part of the library and listed several cases. Well ... it's not that easy as it looked like. First I had to append `(?:\/|$)` at the end because it was possible to capture only part of the URL which is not exactly valid in my case.

```
// this was considered a matching rule while it shouldn't
var route = '/users/list';
'http://site.com/users/listing'.match(new RegExp(route));

// this works better
var route = '/users/list' + '(?:\/|$)';
'http://site.com/users/listing'.match(new RegExp(route));
```

It was important to use a non-capturing group `(?:)` because later I was going to use the capturing group for the URL variables.

Every router needs to support parameterization. These are routes that have variables inside. For example `/user/:id/save`. The `:id` bit could be anything so we can't use a static string. In some router implementation this is defined as `@id` or `{id}` but I think the most common format is `:[variable name]`. So, receiving such string we have to convert it to a regular expression. The tricky part is to keep the name of the variable and later map it to the actual value.

```
var variableNames = [];
var route = '/user/:id/:action'.replace(/([:*])(\w+)/g, function (full, dots, name) {
  variableNames.push(name);
  return '([^\/]+)';
}) + '(?:\/|$)';
var match = 'http://site.com/user/42/save'.match(new RegExp(route));

// At this point
//   variableNames=["id", "action"];
//   match = [
//    "/user/42/save",
//    "42",
//    "save",
//    index: 15,
//    input: "http://site.com/user/42/save"
//  ]

var params = match
  .slice(1, match.length)
  .reduce((params, value, index) => {
    if (params === null) params = {};
    params[variableNames[index]] = value;
    return params;
  }, null);

// params = {id: "42", action: "save"}
```

At the end if we have a matching rule the library fires a handler and passes the `params` object.

The last thing which I did with regular expression was the support of wild cards. Or in other words a variable in the URL but something which I'm not interested in. The wild cards are usually represented by `*` which should be replaced with `(?:.*)`. For example:

```
var route = '/some/page/*/interesting/bit';
route = route.replace(/\*/g, '(?:.*)');
'http://site.com/some/page/blah/dah/doh/interesting/bit'
  .match(new RegExp(route));
```

*(A nice place to try regular expressions could be found [here](http://www.rubular.com/).)*

### Navigating to a new page

If we use hash based routing this is really easy. We know exactly which part of the URL should be replaced. However, with the History API is a bit different. Let's say that we have our application hosted under `http://site.com/app` and we use the following lines to change the page:

```
window.history.pushState({}, '', 'users/list');
// 2 minutes later
window.history.pushState({}, '', 'products');
```

We'll end up seeing `http://site.com/app/users/users/products` in the address bar which is wrong. Should be `http://site.com/app/products`.

A quick way to solve this problem is to use absolute routes like `/app/users/list` and `/app/products`. But then we can't move our application easily because once we change `app` with something else we have to update all the routes.

So if we use `pushState` to change the URL we should always know the root path of our application. Now the question is how to get that dynamically. We anyway touch something on the server to make the History API works so we may get it from there.

```
<?php

  $path = str_replace('index.php', '' , $_SERVER['SCRIPT_NAME']);
  $root = "http://".$_SERVER['HTTP_HOST'].$path;

?>
```

Remember how every request is passed to a single file. Well, the location of this file is our root path. In PHP `$_SERVER['SCRIPT_NAME']` returns exactly what we need. The rest is just passing the `$root` variable to the HTML bit and initialize the route with it. That's one way to solve the problem.

Instead of involving a back-end script I decided to do something else - [Navigo](http://work.krasimirtsonev.com/git/navigo/) is using the registered routes. In theory we should be able to extract the root path based on the passed patterns. What is not matching in those patterns is either the home page or a page which should be considered missing (not found).

```
function root(url, routes) {
  var matched = ...;
  var fallbackURL = url;

  if (matched.length > 0) {
    return matched
      .map(m => url.substr(0, m.match.index))
      .reduce((root, current) => {
        return current.length < root.length ? current : root;
      }, fallbackURL);
  }
  return fallbackURL;
};
```

If we have all the valid routes we may map them to a string containing only the first bit of the match and see which one is the shortest. 

```
var url = 'http://site.com/app/users/list';
var match = url.match(new RegExp('/users/list'));
var root = url.substr(0, match.index);

// root = http://site.com/app
```

Unfortunately this approach has another side effect - it's difficult to cover the *page not found* situation. That's because we always fall back to the current URL and we'll probably always show the home page. However, I personally prefer using this technique because I may drop my app everywhere and don't worry about updating or even having a back-end code.

### Check if there is a History API

In the very beginning of the router we have to decide whether we are going to use the History API or the hash based routing. Here is how the constructor looks like:

```
function Navigo(r, useHash) {
  this.root = r || null;
  this._ok = !useHash && !!(
    typeof window !== 'undefined' &&
    window.history &&
    window.history.pushState
  );
};
```

Notice that we give an option for having strict root path or directly use hashes over `pushState`.

## Wrapping up

Thanks for reading this article. My idea was to be a short one but ... well there are lots of stuff about client-side routing. If you are interested in the details please check [Navigo](http://work.krasimirtsonev.com/git/navigo/) and its [repository in GitHub](https://github.com/krasimir/navigo). As we all like to say "Pull request are welcome" :).










