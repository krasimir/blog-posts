# iFrame, or not, that is the question

One of the things that I really like at [work](http://trialreach.com/) is the fact that we reserve time for research tickets. We have unknowns and we make a research to find out more information on the topic. We then base our decisions on the results. Recently we had to decide whether to use an `<iframe>` for a third party widget development. I feel that the collected information may be handy to someone else so I decided to write it down here.

## The story

A *widget* in the context of web development is a piece of UI that delivers additional functionality or information. It's very often a product of a third company. As such it needs to be integrated into the pages in a save way and (A) it works as expected and (B) doesn't break what's on the page already. There are primarily two ways of achieving this:

* Using an `<iframe>` tag
* Providing a `<script>` tag that injects markup

So, the question is which one of the two methods fits better. They both have pros and cons so let's explore.

## Using an iFrame

Here are the positive sides:

* **Security** - the `<iframe>` tag is considered the safer approach. Mainly because the JavaScript inside the iFrame is running in the context of another page. Of course there are always [security risks](http://stackoverflow.com/questions/7289139/why-are-iframes-considered-dangerous-and-a-security-risk) but it is definitely better then including an external JavaScript that has a direct access to our DOM tree.
* **Doesn't block the rendering** - the iFrame is not blocking the rendering. We may still get our page while the external content is loading.
* **It's not blocked by the main page's JavaScript failure** - imagine that we develop our awesome widget and we place it somewhere with the non-iframe solution. It's a JavaScript driven. Now imagine that something else on the page fails before the browser reaches our JavaScript file. We'll fail delivering our content. By using an iFrame we base the injecting only on HTML rendering, not JavaScript execution.
* **Easy to update / versionning** - at some point we will need to update the widget. If we distribute our widget as a JavaScript snippet we are not directly controlling the injection. It's a piece of code that we can't contribute to and changing it means reaching every single developer that uses it.
* **Our own styling** - it's our own page so the only ones styles that apply are coming from our own stylesheet. This could be a disadvantage if the widget needs to be customizable but that's another story.

Of course, it's not only unicorns and rainbows:

* **In parallel** - indeed the iFrame's content is loaded in parallel with main page's content. However, what third party data is [blocking](http://www.stevesouders.com/blog/2009/06/03/using-iframes-sparingly/) is the `onload` event. All the iFrames on the page also use [the same](http://www.stevesouders.com/blog/2009/06/03/using-iframes-sparingly/) connection pool. We have a limited number of connections. The browsers open just a few in parallel to a given web server.







# iFrame

  + Secure
  + Don't block rendering
  + It's not blocked by host's JS failure
  + Easy to update (versioning)
  + Our own styling (including pseudo classes and media queries)

  - Responsiveness (size). Poor integration with the host page.
    (https://www.smashingmagazine.com/2014/02/making-embedded-content-work-in-responsive-design/ provides a good workaround if we know the aspect ratio w/h)
  - Configuration. How we are going to pass settings to the widget?

  ! Testing (all we have to do is to place our iframe in a page with similar layout)

# non-iFrame

  + Flexibility (we can easily provide an API for all the settings)

  - CSS Conflicts (we'll probably have to reset styles and use only inline styling)
  - JS Conflicts (we can't really touch the global scope (not like we are doing it but ...))
  
  - Difficult to update if we use a bootstrap script (versioning)

  ! Better served via HTTPS
  ! We should handle errors in a very proper way. We don't want to break the host page.
  ! The bootstrap script (if any) should be really small and cross-browser compatible
  ! Testing (if we have a bug on particular partner page we'll probably have to replicate the exact page)
