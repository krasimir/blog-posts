# The Flash Builder debugger failed to connect to the running application.

I really don't like FlashBuilder. Mainly because I'm losing a lot of time just to setup the project. Usually when I receive the files I need around 10 hours just to compile successfully. The reasons for those problems are different Flex SDK, different directories' tree, wrong paths, missing libraries or fonts. Today I encounter a brand new type of problem.[STOP]

This time I got the following error:

	The Flash Builder debugger failed to connect to the running application.
	Ensure that:
		1. For in-browser applications, you are running the debugger version of Flash Player.
		2. For network debugging on a mobile device, you have a reliable network connection to the device, and port 7935 is open on your machine's firewall.
		    Device connection help

I hit F5 and start waiting. The process bar in the lower right corner looks like that for a long time.

![flash builder problem](http://krasimirtsonev.com/blog/articles/TheFlashBuilderDebuggerFailedToConnectToTheRunningApplication/pics/pic2.jpg)

A new empty page was opened in my default browser - Google Chrome. Nothing happens for a few minutes and I got.

![flash builder problem](http://krasimirtsonev.com/blog/articles/TheFlashBuilderDebuggerFailedToConnectToTheRunningApplication/pics/pic1.jpg)

So, it looks like I'm trying to test the application with a non-debug version of the flash player. Actually Google Chrome has in-build flash player, which is updated automatically. Even if you install the debug one, very soon Chrome will replace it. 

## Solution #1
Just change the browser. For example, in Firefox the player is installed externally and you are able to install the debug version. 
Choose Windows -> Preferences and type *browser* in the search field.

![flash builder problem](http://krasimirtsonev.com/blog/articles/TheFlashBuilderDebuggerFailedToConnectToTheRunningApplication/pics/pic3.jpg)

After that you should be able to see the application.

## Solution #2
However, jumping to the browser is not very handy. I mean, while I'm debugging I want to see the console and all my logs there. So, running the application in the browser is not the best option. There is a way to tell that you want to test the compiled swf file, not the html file. They are both inside your *bin-debug* folder (have in mind that this is the default name of this directory. It could be different inside your project).

Choose Run -> Run Configurations. Pay attention to the *URL or path to launch*. Uncheck the option, click on the *Browse* button and navigate to your swf file. It should be in *bin-debug* folder.

![flash builder problem](http://krasimirtsonev.com/blog/articles/TheFlashBuilderDebuggerFailedToConnectToTheRunningApplication/pics/pic4.jpg)

After that your project will run in a stand-alone flash player.

## Conclusion

Just use [FlashDevelop](http://www.flashdevelop.org/). It's just better and simple then FlashBuilder.