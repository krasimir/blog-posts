# Send message from web page to chrome extension's background script 

I just answer on that question in [StackOverflow](http://stackoverflow.com/questions/18374252/how-do-i-pass-back-data-from-a-remote-window-to-a-chrome-extensions-background/18377748#18377748). I think that this is a common quetion so it worths writing about it. 

The idea is use the content script as a bridge between your web page and the background script. Let's get the following code put in the background:

	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	    alert("message received");
	});

	chrome.windows.create({
	    type : 'popup',
	    url : "http://yoursite.com/page.html",
	    type: "popup"
	}, function(newWindow) {

	});

The part of the snippet actually waits for a message coming from the content script. That's the place where you will be notified that something occur inside your web page. The second part creates a new window which loads the given url. (You may skip that. I added it in the article just because the question in stackoverflow contains it.)

In your web page you have to dispatch an event by using the *document* object:

	<script>
	    var go = function() {
	        var event = document.createEvent('Event');
	        event.initEvent('hello');
	        document.dispatchEvent(event);
	    }
	</script>
	<a href="javascript:go();">Click me</a>

And at the end your content script should contains:

	document.addEventListener("hello", function(data) {
	    chrome.runtime.sendMessage("test");
	});

You just catch the event send from the page and send another one to the background script.