# CSSSteal - Chrome extension that extracts CSS

[We](http://trialreach.com/) had to update some of our old pages adding new elements. This means mixing old and new code. Placing HTML markup and JavaScript in legacy pages is not that difficult. Yes, it brings some issues but they are easily solvable. However, the CSS is a whole new story. That's why I did [CSSSteal](https://chrome.google.com/webstore/detail/csssteal/ellabkgcnhflepncdcnelhgclfkgmanh). It helps me extract the needed styles.

## The problem

As I mentioned above adding HTML markup and JavaScript in old pages is not so problematic. We had some small conflicts but in general was just copy-paste. Unfortunately wasn't so simple with the CSS. We can't just get the new CSS bundle and add it after the old one because it will overwrite some of the styles needed for the old components. We can't use the computed styles for the new components because that means styling every single HTML element. What we really needed was portion of the new CSS bundle that is responsible for specific DOM element and its children. 

Let's say that we have the markup and CSS below and we need to extract the `<section>` from it.

```
// markup
<div class="contaner">
  <section>
    <ul>
      <li>Point 1</li>
      <li>Point 2 <small>(description)</small></li>
      <li>Point 3</li>
    </ul>
  </section>
  <footer>
    Copyright &copy; <small>2015</small>
  </footer>
</div>

// css
.container { font-size: 20px; }
small { font-size: .8em; }
section { ... }
section ul li { ... }
section small { ... }
footer { ... }
footer small { ... }
```

We need the CSS applied to the `<section>` tag and also the styles targeted to the list inside. What we don't need are the two lines in the end. So we end up with:

```
.container { font-size: 1.2em; }
small { font-size: .8em; }
section { ... }
section ul li { ... }
section small { ... }
```

Notice that we copied `.container` and `small` definitions too. Those are needed because they set rules which are applied to the desired element `<section>` and some of its children. 

That is a simple example and it is easy to spot the needed CSS. However, if we have a complex page it gets difficult and time consuming to find the exact lines that style specific part of the page. That is why we need to do that programmatically.

## Solution

Thankfully there is [document.styleSheets API](https://developer.mozilla.org/en-US/docs/Web/API/Document/styleSheets). It represents a collection of the CSS used in the current page. What we can do is looping through the sheets and get all the styles. Then use the [element.matches API](https://developer.mozilla.org/en-US/docs/Web/API/Element/matches) to see what CSS applies to our elements.

```
// helper function for transforming 
// node.children to Array
var toArray = function(obj, ignoreFalsy) {
  var arr = [], i;
  for (i = 0; i < obj.length; i++) {
    if (!ignoreFalsy || obj[i]) {
      arr[i] = obj[i];
    }
  }
  return arr;
}

// looping through the styles and matching
var getRules = function (el) {
  var sheets = document.styleSheets, result = [];
  el.matches = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector;
  for (var i in sheets) {
    var rules = sheets[i].rules || sheets[i].cssRules;
    for (var r in rules) {
      if (el.matches(rules[r].selectorText)) {
        result.push(rules[r]);
      }
    }
  }
  return result;
}

// looping through the element's children
var readStyles = function (els) {
  return els.reduce(function (styles, el) {
    styles.push(getRules(el));
    styles = styles.concat(readStyles(toArray(el.children)));
    return styles;  
  }, []);
};

var element = document.querySelector('section');
var css = readStyles([element]);
```

Using the code above we may extract [CSSStyleRule](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleRule) items. They give us an access to [CSSStyleDeclaration](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration) with all the CSS rules.

## CSSSteal

And because I didn't want to write code in the console every time I formed a library called [CSSSteal](https://github.com/krasimir/css-steal). It's available in [npm](https://www.npmjs.com/package/css-steal) and its usage is as follows:

```
var CSSSteal = require('css-steal');
var css = CSSSteal(document.querySelector('.my-class'));
css.toCSSText(); // produces formatted CSS styles
css.toJS(): // returns an array of objects containing the styles
```

There is also a [Chrome extension](https://chrome.google.com/webstore/detail/csssteal/ellabkgcnhflepncdcnelhgclfkgmanh) that looks like that:

![CSSSteal](http://krasimirtsonev.com/blog/articles/CSSSteal/css-steal.jpg)

It is available in the DevTools Elements panel and we may select more then one DOM element. This shrinks the resulted CSS because it merged styles.

## All good but we are not living in a perfect world

There are cases where we can't access the current styles via `document.styleSheet` API. That's when the CSS is loaded from a different domain or local file system. If you for example open [https://developer.mozilla.org](https://developer.mozilla.org) and write `document.styleSheets[0].cssRules` you'll get `null` as a result. That's because Mozilla uses CDN for its CSS and that's a different domain. There is a Chromium issue filed [here](https://code.google.com/p/chromium/issues/detail?id=49001) but I don't think that this will be fixed because of [this](http://arstechnica.com/information-technology/2010/09/microsoft-investigates-public-ie-css-xss-flaw-twitter-hotmail-vulnerable/) security problem.
