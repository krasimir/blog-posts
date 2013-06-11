# Convert HTML string to DOM element

I'm working on a [chrome extension](https://chrome.google.com/webstore/detail/auxilio/ddkgloamdhkoohfgmopdicfcinddpnhh?hl=en-US) which accepts user text, work with it and output the result in a div. I used [jQuery](http://jquery.com/) in the beginning, for several tasks, but later I decided to remove it and deal with pure javascript/DOM manipulations. The output div was filled by using *innerHTML* property and everything was ok. But, at some point, I sent few buttons to the user and he has to interact with them. However, once I update the div's content the event listeners are detached and the buttons became non-functional.[STOP]

Here is a small jsfiddle, which illustrates the problem.

<iframe width="100%" height="300" src="http://jsfiddle.net/krasimir/nZhbE/9/embedded/result,html,js,css/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

I.e. once you add a new markup, an event is attached to the link. It does its job till a new HTML is inserted. Because the whole content of the output div is replaced only the latest button has a valid listener.

	index = 0;
	addMarkup = function() {
	    var output = document.getElementById("js-output");
	    var htmlButton = '<a href="#" class="btn" id="button' + index + '">click here please</a>';
	    output.innerHTML = htmlButton + output.innerHTML;
	    document.getElementById("button" + (index++)).addEventListener("click", function() {
	        alert("button clicked");
	    });
	}

So, the solution was to avoid the usage of *innerHTML* and insert the markup with *appendChild* or *insertBefore* methods. The problem is that those functions accept DOM elements not string. 

## Try #1 (document.createElement)

Something like this may work:

	var link = document.createElement("A");
	link.setAttribute("href", "#");
	link.addEventListener("click", function() {
		alert("it works");
	});
	output.appendChild(link);

But of course it didn't work in my case, because I had complex markup which involves several nested elements. It wasn't possible to create everything with *document.createElement*.

## Try #2 (DOMParser)

There is an object *DOMParser*, which seems perfect for the situation:

	var markup = '<div><p>text here</p></div>';
  	var parser = new DOMParser()
  	var el = parser.parseFromString(markup, "text/xml");

However it works a little bit strange. The created *el* object is not exactly a DOM element. I had to use *el.firstChild* or *el.childNodes[0]* to get the actual thing. The styling of the elements inside didn't work and sometimes some of the them weren't rendered at all.

## Try #3 (little dirty hack)

As normally happen I ended with a little dirty hack.

	var str2DOMElement = function(html) {
		var frame = document.createElement('iframe');
		frame.style.display = 'none';
		document.body.appendChild(frame);			  
		frame.contentDocument.open();
		frame.contentDocument.write(html);
		frame.contentDocument.close();
		var el = frame.contentDocument.body.firstChild;
		document.body.removeChild(frame);
		return el;
	}

I.e. I created an iframe, adding the markup inside the iframe produced a valid DOM element. I got the needed element and at the end removed the iframe from the DOM.

If you have any other workarounds for the problem please feel free to comment below. Have in mind that I don't want to use jQuery-liked libraries.