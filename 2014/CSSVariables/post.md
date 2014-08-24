# CSS variables are here for ages

Every front-end developer that starts reading about CSS preprocessors thinks "Oh, finally variables in CSS". Indeed, the ability to create and use variables in CSS makes our code much more flexible. However, I think that there is no need to use a preprocessor to create flexible stylesheets. 

## What is a *variable* actually

According to [Wikipedia](http://en.wikipedia.org/wiki/Variable_(computer_science))):

    "variable or scalar is a storage location and an associated symbolic name (an identifier)
    which contains some known or unknown quantity or information, a value"

Shortly, a *variable* is some storage of our values. Also, we need storages because we do not want to write same values again and again. Moreover, of course, if we need to update the value we do not want to go all over our code and make changes. So, for me there are two characteristics of the variables that make them extremely useful:

* Reusing of same values here and there
* Single point of configuration

In the CSS world, we have many things that need to be variables. For example the main colors, the font sizes, font faces, gaps between the elements. That is why we were very happy when the preprocessors came. Finally, we have that:

    // styles.scss
    
    $primary-color: #333;

    body {
        color: $primary-color;
    }

In the [Sass](http://sass-lang.com/) example above the *$primary-color* is a storage of the value *#333*.

## Can I use variables in vanilla CSS?

The answer is NO (not yet). There is [specification](http://dev.w3.org/csswg/css-variables/) for that but that feature is not supported by most of the browsers. Here is how it looks like:

    :root {
        --main-color: #06c;
    }
    #foo h1 {
        color: var(--main-color);
    }

We define our variables in the top of the file and use the *var* keyword when we need them. It looks promising, but it is still not implemented in the stable version of the browsers. It is more like an experimental technology.

## Thinking out of the box

Most people do not realize, but we are already using the variable-like coding in CSS already. Let's take the following example:

    // html
    <div class="container">
        <div class="content">Content here ...</div>
    </div>

    // css
    .container {
        width: 400px;
    }

In the DOM tree, we have something beautiful. We have nesting and inheritance of styles. In the example above the *width* of the *.content* div is actually equal to the *width* of the *.container*. It is like that because the default value of that property is *auto* which mean *100%* of the containing block. 

If we stop for a while and start thinking about what we did above we will see that we define a variable that has value of *400px*. Let's say that we want our *.content* div 324 pixels wide. Instead of writing

    .content {
        width: 324px;
    }

we may use the following:

    .content {
        width: 81%;
    }

We have a single point of configuration. We may add other children of the *.container* div, and they all will have the same 400 pixels as a base. 

We could apply the same concept to text's color. Considering the following HTML markup:

    <div class="container">
        Some text
        <div class="content">
            Content here ...
            <a href="#">link</a>
        </div>
    </div>

We may define the color in the very top element:

    .container {
        color: #F00;
    }

The *.content* div inherits the value, and the text *Content here ...* is colored in red. However, the link does not. By default, the browser applies blue and overwrites our definition. Now, instead of using *color: #F00* we should write:

    .content a {
        color: inherit;
    }

This tells to the browser that we want the value from the containing block. If, at some point, we decide to change the text color of our application we will do it in one place - the *.container* styles. It sounds like we are working with variables right.

This way of thinking may be a powerful instrument. Especially in the responsive design matter. 

## Improve your responsiveness

Recently I am finishing an HTML/CSS prototype of web application. One of the main requirements was that the app should be responsive, and it should cover wide range of devices. No framework involved. I had to write it in vanilla CSS. Once I started applying the concept above everything became fluent.

I'll illustrate my workflow with a simple example:

    <div class="container">

        <div class="content">
            <h1>I'm a title</h1>
            <p>Ullam, laborum, dolore debitis eaque itaque repellendus doloribus.</p>
        </div>

        <div class="footer">
            <div class="info">Company Info</div>
            <div class="links">
                <a href="#">A</a>
                <a href="#">B</a>
                <a href="#">C</a>
            </div>
        </div>

    </div>

We have a content block and a footer. The base font size is defined in the styles of the *body* tag:

    body {
        font-size: 22px;
    }

By default, these 22 pixels are spread to all the elements on the page (except the headings). So, the text and the links in the footer are also at *22px*. On desktop everything looks OK. A nice big font and with proper font face the result is good enough. However on small devices we have to decrease the value of *font-size* property. We add the following meta tag in the *<head>* of the document and start playing with media queries.

    <meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1.0, maximum-scale=1.0" />  

One possible solution would be:

    @media all and (max-width: 400px) {
        .content h1 { font-size: 32px; }
        .content p { font-size: 16px; }
        .footer .info { font-size: 16px; }
        .footer .links { font-size: 16px; }
    }

However, it is not flexible at all because we used these strictly defined values. Once we add another element in the DOM, we have to add a new rule. 

A better approach would be to use *em* as a unit and not *px*. The *em* is relative to the containing block. In our case *1em* is equal to *22px*, because that is the default *font-size* of the very top element in the DOM tree.

We want to apply *16px* as a font-size if the viewport's size is under *400px*. If *1em* is equal to *22px* then *0.7272em* will be *16px* (*15.9984px*). All we have to do is to apply styles to the *.container* div:

    @media all and (max-width: 400px) {
        .container {
            font-size: 0.7272em;
        }
    }

It is that simple. The paragraph, the company's information text and the links get *16px* font size. The heading is by default *2em*, so it receives *32px*. 

Now, let's say that under *380px* we want to have smaller letters but only in the *.footer*. And we want to apply *14px* instead of *16px*. It is clear that we will define rules directly for the footer, but this time we depend on the *.container* and not on the *body* element. So *14/16 = 0.875*:

    @media all and (max-width: 380px) {
        .footer {
            font-size: 0.875em;
        }
    }

Of course, the *em* unit may be used not only for setting the size of the font but for everything else. For example:

    .banner {
        width: 10em; // 220px;
    }

It has the same effect. If we change the *font-size* property of the banner's container, its size will be updated accordingly.

Here is a JSBin demonstrating the final result:

<a class="jsbin-embed" href="http://jsbin.com/webox/19/embed?css,output">JS Bin</a><script src="http://static.jsbin.com/js/embed.js"></script>

## Summary

Knowing how to use the inheritance in CSS is a handy skill. We write less, smarter and much more flexible styles. The fact that the values in CSS are coming from the containing block is very often underestimated. However, as we saw, this could improve our code. Especially while developing responsive web applications.