# All about client-side routing

<small>*(This blog post is inspired by [A modern JavaScript router in 100 lines](http://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url) and heavily related to [Navigo](http://work.krasimirtsonev.com/git/navigo/) router project.)*</small>

If you build single page applications you probably know that one of the must-have parts is the router. The bit that knows how to change the content of the address bar and magically updates the content of the page. In this article we will discuss the various aspects of the routing in the browser.

## The client-side routing is not a new thing

I used to develop [Flash](http://www.adobe.com/en/products/flash.html) based applications back in the days. The biggest problem was the fact that they run in a plugin, in a black box. So, the browser is not aware of the changes that happen inside. And again we had different pages, we had to keep state and all these stuff which we now make with JavaScript. To make the project browseable from the outside we used a technique called *deep linking*. I even blog about that, [five years ago](http://krasimirtsonev.com/blog/article/deep-linking-in-flash-with-as3-and-javascript). There is a library [SWFAddress](http://www.asual.com/swfaddress/) which was used everywhere and all companies adopted the idea. Even Adobe. The funny thing is that today, five years later, we have to do the same thing. If we have to support IE9 and below we have to use the same hash based routing.

## Hash-based routing

What we meant by hash-based routing is using the anchor part of the URL to simulate different content. For example `http://site.com/#/products/list` leads to displaying a list of products. We have to mention that the `#/products/list` bit is never sent to the server. So, by using this approach we are completely operating in the client-side. The routing is possible because changes in the hash don't trigger page reload.

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

We have a `window.history` object which provides several methods for manipulating the history of the browser. We have for example `window.history.back()` for moving a step back or `window.history.forward()` to do the opposite. More interestingly is [`window.history.pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) method:

```
var stateObj = { foo: "bar" };
history.pushState(stateObj, "page 2", "bar.html");
```

That's how we create a new entry in the history of the browser. In the snippet above we pass a state, title (which is ignored by some browsers) and an URL. The browser immediately replaces the current URL with the provided one. If we later go back to the same entry a [`popstate`](https://developer.mozilla.org/en-US/docs/Web/Events/popstate) event is fired where we could fetch the state object.

```
window.onpopstate = function (event) {
  console.log('state: ' + JSON.stringify(event.state));
};
```

The effect of `pushState` is indeed really cool. However, 

## Client-side routing is not exactly only client-side

Client-side routing means using JavaScript to switch the pages in our application. It's tempting because we don't have to send a request to the server. The whole process happen in the same session. Thankfully to the [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API), which we'll see in details later, we may change the current URL without reloading the whole page. However, this can not happen if we don't have an access to th server and its configuration. Or at least some option to forward requests.

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

We know that most servers open `index.html` file if physically exists at the requested path. In the image above we request `http://site.com` and we receive `/index.html`. However, at some point we click on a link and using the History API we change the URL to `http://site.com/products/list`. We change the content of the page and everything seems ok. The problem is that if we refresh the browser or copy and paste the new URL we'll get nothing (probably 404 page not found error). It's like that because there is no (physically) `/products/list/index.html` file on the server. 

The problem could be solved if we amend the configuration of the server and forward all the requests to the same `index.html` file. JavaScript has an access to the current page's URL so we may resolve the path and map it to a page. 

If we use [Apache](https://httpd.apache.org/) as a server we may [easily apply a `.htaccess`](http://krasimirtsonev.com/blog/article/apache-htaccess-for-html5-push-state-manipulations) file:

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

If we use hash based routing we may leave our server untouched. History API is anyway [not supported](http://caniuse.com/#search=pushState) in IE9 and below so we should fallback to the good old hash routes.


