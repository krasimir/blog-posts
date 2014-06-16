# Sorry, Chrome killed the terminal

That's right. I'm not using the terminal anymore. Instead of that I'm using Chrome. Yes, the Google's browser. There is an extension called [Yez!](https://chrome.google.com/webstore/detail/yez/acbhddemkmodoahhmnphpcfmcfgpjmap) that connects to a Node.js module via web socket. It executes the shell commands and returns the result. And even works under Windows.

## The motivation

There are several reasons behind the development of the extension:

* If we develop Node.js applications we will switch between the terminal and the browser. That's really annoying. We have to do that all the time, for every little change. So, moving the shell into the browser seems like a logical step.
* If we don't like to write shell scripts then this extension is perfect for us. Developing our own terminal in JavaScript will allow us to produce better automation.
* Chrome extensions are constructed with the usual web technologies - JavaScript, HTML and CSS. So we have the power to build the tool that fits perfectly in our workflow.

## Is it really a terminal?

Yes, it is. What it does is to proxy the shell commands. They are still executed on the same place. The difference is that it is not the terminal that runs them but a Node.js process. And, of course, the [Yez!](https://chrome.google.com/webstore/detail/yez/acbhddemkmodoahhmnphpcfmcfgpjmap) module uses [spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) so it sends the command's output directly to the browser once it appears. It doesn't wait for the operation's end to show something. As it happens with [exec](http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback). (More about managing child process in Node.js could be found [here](http://krasimirtsonev.com/blog/article/Nodejs-managing-child-processes-starting-stopping-exec-spawn)). Checkout the following image. It illustrates how everything works:

![Yez! Chrome extension](http://krasimirtsonev.com/blog/articles/ChromeKilledTheTerminal/imgs/yez_01.gif)

As we can see, we are able to navigate through the directories and execute commands. The extension checks if the current directory is a valid <i>Git</i> repository. If yes it shows the current branch and if there are any changed files.

## It's also a task runner

When we have an instrument that runs shell commands, it make sense to provide functionality for task executing - running several commands at once. That's not something incredible, but the really valuable thing is that we are doing this from a browser. Also, thankfully to Google, we have access to APIs for controlling programmatically the browser. 

The following animated gif shows how we create a task for running [Jasmine](https://github.com/pivotal/jasmine) tests on a project and perform a search in GitHub.

![Yez! Chrome extension](http://krasimirtsonev.com/blog/articles/ChromeKilledTheTerminal/imgs/yez_02.gif)

## How to get started

* Install the [Yez! module](https://www.npmjs.org/package/yez) by running <i>npm install -g yez</i> or <i>npm install -g https://registry.npmjs.org/yez/-/yez-1.0.5.tgz</i> if the first command doesn't work. If you still have problems installing the module check out [this thread](https://github.com/krasimir/yez/issues/1).
* Run <i>yez</i> in your console
* Open Chrome browser and install the extension from [here](https://chrome.google.com/webstore/detail/yez/acbhddemkmodoahhmnphpcfmcfgpjmap)
* Open Chrome's DevTools and find the <i>Yez!</i> tab

## Contribution

Of course, the project is open source. Feel free to report issues or make pull requests at [https://github.com/krasimir/yez](https://github.com/krasimir/yez).

## The truth

Of course, I'm using the good old terminal too. There are some things that could not be achieved with Node.js. Like for example SSH connection to a server or complex piping of commands. However, for the regular tasks I prefer to stick to the extension. There is directories' name autocompletion and few keyboard shortcuts. I'm planning to provide functionality for registering aliases. In other words all those small goodies that will boost my productivity.