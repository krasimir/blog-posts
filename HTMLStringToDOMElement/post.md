# How to properly convert HTML string to a DOM element

This seems like a trivial task. However, it is not. There are few popular solutions, but they have a big problem and if you use them a lot you will spot the issue.[STOP]

Let's say that we have the following HTML markup:

	<section><a href="#">Link label</a></section>

If you [google](http://lmgtfy.com/?q=html+string+to+dom+element) the problem you will find that the most popular solution involves the usage of <i>.innerHTML</i> property of a newly created element.

	var notWorking = function(html) {
	    var el = document.createElement('div');
	    el.innerHTML = html;
	    return el.childNodes[0];
	}
	console.log(notWorking('<section><a href="#">Link label</a></section>'));

The result of the above script is actually correct. You will get section element with link inside it. Everything seems ok and it looks like you did the trick. Now let's try with something else:

	console.log(notWorking('<tr><td>Text Here</td></tr>'));

The result is only

	Text Here

Hm ... the &lt;tr&gt; and &lt;td&gt; tags are missing. This seems wrong isn't it. Actually that's kinda correct behaviour of the browser. I searched for similar problems and landed on [this article](http://www.ericvasilik.com/2006/07/code-karma.html) by Eric Vasilik. Here is what he said back at 2006:

<i>"When one sets the innerHTML property of an element, the string containing the HTML is run through the parser."</i>

and 

<i>"Now, parsing something like "&lt;tr>&lt;td>Foo" where there is no TABLE tag preceding the TR causes the parser to ignore the TR tag altogether."</i>

So, I realize that the string which is passed to <i>.innerHTML</i> shouldn't be just a mix of tags. It should be a valid DOM representation. If I want to use the function above I should pass &lt;table> tag as well. And I did, I tried with the following code:

	console.log(notWorking('<table><tr><td>Text Here</td></tr></table>'));

and the result was:

	<table>
		<tbody>
			<tr>
				<td>Text Here</td>
			</tr>
		</tbody>
	</table>

Which proves the words from Eric Vasilik. My method should somehow examine the passed HTMl and automatically adds the necessary tags. Along with that it should return not the first child node, but the correct nested element. Looks like a lot of work. 

Ok, but ... wait a minute. jQuery doesn't have this problem. You may pass <i>&lt;tr>&lt;td>Text Here&lt;/td>&lt;/tr></i> and still get the desired result. I started digging into the jQuery's code and found this:

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		area: [ 1, "<map>", "</map>" ],
		param: [ 1, "<object>", "</object>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
		// unless wrapped in a div with non-breaking characters in front of it.
		_default: jQuery.support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>"  ]
	},

This looks like the magic which solves the problem. I cheated a bit and got the code above. I managed to extract that functionality into a single method:

	var str2DOMElement = function(html) {
	    /* code taken from jQuery */
	   var wrapMap = {
	        option: [ 1, "<select multiple='multiple'>", "</select>" ],
	        legend: [ 1, "<fieldset>", "</fieldset>" ],
	        area: [ 1, "<map>", "</map>" ],
	        param: [ 1, "<object>", "</object>" ],
	        thead: [ 1, "<table>", "</table>" ],
	        tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	        col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
	        td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	        // IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
	        // unless wrapped in a div with non-breaking characters in front of it.
	        _default: [ 1, "<div>", "</div>"  ]
	    };
	    wrapMap.optgroup = wrapMap.option;
	    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	    wrapMap.th = wrapMap.td;
	    var element = document.createElement('div');
	    var match = /<\s*\w.*?>/g.exec(html);
	    if(match != null) {
	        var tag = match[0].replace(/</g, '').replace(/>/g, '');
	        var map = wrapMap[tag] || wrapMap._default, element;
	        html = map[1] + html + map[2];
	        element.innerHTML = html;
	        // Descend through wrappers to the right content
	        var j = map[0]+1;
	        while(j--) {
	            element = element.lastChild;
	        }
	    } else {
	    	// if only text is passed
	        element.innerHTML = html;
	        element = element.lastChild;
	    }
	    return element;
	}

The map of jQuery nicely shows me what exactly I should wrap my string in. There are few lines of code which find the root tag and its type. At the beginning I wondered what are this numbers in the <i>wrapMap</i> object for. Later I found this:

	j = wrap[0];
	while ( j-- ) {
		tmp = tmp.lastChild;
	}

That was the code that returns the needed DOM element from the build tree. And the numbers were the level of nesting. Pretty simple, but I think, one of the most used features of jQuery.

<i>Edit (18-02-2014)</i>

There is a special case when you want to create a new *body* tag. The function above doesn't work because the *div* element could not have a *body* inside. Here is the fixed version.

	var str2DOMElement = function(html) {
	    var wrapMap = {
	        option: [ 1, "<select multiple='multiple'>", "</select>" ],
	        legend: [ 1, "<fieldset>", "</fieldset>" ],
	        area: [ 1, "<map>", "</map>" ],
	        param: [ 1, "<object>", "</object>" ],
	        thead: [ 1, "<table>", "</table>" ],
	        tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	        col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
	        td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
	        body: [0, "", ""],
	        _default: [ 1, "<div>", "</div>"  ]
	    };
	    wrapMap.optgroup = wrapMap.option;
	    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	    wrapMap.th = wrapMap.td;
	    var match = /<\s*\w.*?>/g.exec(html);
	    var element = document.createElement('div');
	    if(match != null) {
	        var tag = match[0].replace(/</g, '').replace(/>/g, '').split(' ')[0];
	        if(tag.toLowerCase() === 'body') {
	            var dom = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
	            var body = document.createElement("body");
	            // keeping the attributes
	            element.innerHTML = html.replace(/<body/g, '<div').replace(/<\/body>/g, '</div>');
	            var attrs = element.firstChild.attributes;
	            body.innerHTML = html;
	            for(var i=0; i<attrs.length; i++) {
	                body.setAttribute(attrs[i].name, attrs[i].value);
	            }
	            return body;
	        } else {
	            var map = wrapMap[tag] || wrapMap._default, element;
	            html = map[1] + html + map[2];
	            element.innerHTML = html;
	            // Descend through wrappers to the right content
	            var j = map[0]+1;
	            while(j--) {
	                element = element.lastChild;
	            }
	        }
	    } else {
	        element.innerHTML = html;
	        element = element.lastChild;
	    }
	    return element;
	}
