# Develop Node.js applications with Google Chrome

Google chrome is my favorite browser. I'm spending a big part of my working hours there, so it makes sense to use it for everything. Last week I posted ["Sorry, Chrome killed the terminal"](http://krasimirtsonev.com/blog/article/Sorry-Chrome-killed-the-terminal). The article was about [Yez!](https://github.com/krasimir/yez), an extension that brings terminal-liked functionalities to the browser. Today, I'll show you how I use Chrome in my Node.js development workflow.

## The Node.js app

Let's create new folder and place the following <i>server.js</i> file there:

    var http = require('http');
    var url = require('url');
    http.createServer(function (req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        var page = '';
        if(url_parts.path == 'text') {
            page += '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>';
        } else {
            page += '<p>Hello World</p>';
            page += '<p><a href="/text">Please, click me</a></p>';
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(page);
    }).listen(1337, '127.0.0.1');
    console.log('Server running at http://127.0.0.1:1337/');

When we run the server with <i>node ./server.js</i> we will have <i>http://127.0.0.1:1337/</i> page available. It simply shows a welcome screen with a link. Once the link is clicked we should see the <i>Lorem ipsum</i> text. Let's try this in the browser:

![Develop Node.js applications with Google Chrome](http://krasimirtsonev.com/blog/articles/NodejsAppsWithChrome/imgs/yez_01.gif)

Hm ... something goes wrong. After the click, the URL was changed, but we didn't see the text. So, now our steps are:

* go back to the editor (Alt+Tab x 1)
* place few <i>console.log</i> here and there
* go to the console (Alt+Tab x 2)
* press Ctrl+C to stop the running Node.js app
* press Up+Enter to run it again
* go to the browser again (Alt+Tab x 3)
* refresh the page and click on the link again
* go to the console (Alt+Tab x 4)
* monitor the result and hopefully come with a solution

Yes, if we have more than one monitor it is not a big deal because we will probably have the terminal shown together with the browser. However, sometimes (at least happens to me) we can't use a second monitor. So, imagine how many times we have to repeat the steps above. 

I decided to invest time developing a Chrome extension that eliminates the usage of the terminal in cases like the one above. 

## Using Yez!

The installation of the extension is pretty straightforward. You have to go to [this address](https://chrome.google.com/webstore/detail/yez/acbhddemkmodoahhmnphpcfmcfgpjmap) and click on the big green button at the right upper corner. After the installation finishes, you will have a brand new tab in your DevTools. There is one more thing to make Yez! working. The extension needs a specific Node.js module setupped and running. It is needed because by default the extensions in Chrome live in a sandbox. We can't run other processes or read from the disk. So, we need to execute </i>npm install -g yez</i> and then <i>yez</i>. The module will open a web socket that we will use to transfer data back and forth. (If you have any problems installing the Node.js module please check [this issue thread](https://github.com/krasimir/yez/issues/1))

Once we have everything running we are ready to start, stop and monitor our Node.js scripts. Let's see how:

![Develop Node.js applications with Google Chrome](http://krasimirtsonev.com/blog/articles/NodejsAppsWithChrome/imgs/yez_02.gif)

We didn't go to the terminal at all. Everything happened in the browser, and we were able to see the Node.js script output right away. 

We skipped some points from the list above, but we still have to press Up+Enter to run the server. Yez! supports definition of tasks that could make our life even easier.

## Defining tasks

It's simple. We set a working directory and add (as many as we want) commands. They will be executed one after each other. For example:

![Develop Node.js applications with Google Chrome](http://krasimirtsonev.com/blog/articles/NodejsAppsWithChrome/imgs/yez_03.gif)

Instead of stopping and starting the application again and again, there is a button <i>restart</i> that does all this for us. It just stops the current active process and restarts the whole chain of commands.

## Bonus (creating aliases)

Yez! is handy not only for Node.js apps development but for dealing with the usual terminal tasks. I personally use Git a lot and all I do with it is happening in the console. Let's say that we want to clone some repository, make a change and commit the updates.

![Develop Node.js applications with Google Chrome](http://krasimirtsonev.com/blog/articles/NodejsAppsWithChrome/imgs/yez_04.gif)

We defined two aliases. The first one was for one command only - <i>git clone</i>. The second one combines several actions. Yez! registers its aliases as regular expressions. So, we are able to use <i>$n</i> placeholders. 

    ^gc (.*):git clone $1
    ^cipm (.*):git add . && git commit -m "$1" && git push origin master

Notice that we didn't add quotes around the commit message but it was handled properly.