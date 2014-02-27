If you build web applications you probably communicate with the DOM a lot. Accessing and manipulating DOM elements is the thing which we do almost every day. Very often we collect information from different controls, we need to set values, change the content of <i>div</i> or <i>span</i> tags. Of course there are million libraries which handle these actions. The most popular jQuery, is de factor a standard. However, sometimes you need something smaller. In this article we will build our own class for managing DOM elements.

## The API

As developers we take decisions every day. I believe in the test-driven development and one of the things which I really like is the fact that we are taking design decisions before to start the actual coding. Here is how I want the class's API to look like at the end.

	// returns DOM element
	dom('.selector').el
	// returns the value/content of the element
	dom('.selector').val() 
	// sets the value/content of the element
	dom('.selector').val('value') 

That's good. It covers most of the possible use cases. However it will be even better if we could manipulate several objects at once. And it will be great if we generate a JavaScript object.

	// generates an object containing DOM elements
	dom({
		structure: {
			propA: '.selector',
			propB: '.selector'
		},
		propC: '.selector'
	}) 

Once we have our elements stored we could easily execute the <i>val</i> method for all of them.

	// retrieving the values of several DOM elements
	dom({
		structure: {
			propA: '.selector',
			propB: '.selector'
		},
		propC: '.selector'
	}).val()

This will be effective method for translating data from the DOM directly into JavaScript object.

We have an idea about the API and our class starts with the following code:

	var dom = function(el) {
		var api = { el: null }
		api.val = function(value) {
			// ...
		}
		return api;
	}

## Scoping

It is clear that we are going to use methods like <i>getElementById</i>, <i>querySelector</i> or <i>querySelectorAll</i>. Normally we access the DOM like that:

	var header = document.querySelector('.header');

What is really interesting here is that the <i>querySelector</i> for example is not only method of the <i>document</i> object, but also of any other DOM element. This means that we are able to run the query in specific context. For example:

	<header>
		<p>Big</p>
	</header>
	<footer>
		<p>Small</p>
	</footer>

	var header = document.querySelector('header');
	var footer = document.querySelector('footer');
	console.log(header.querySelector('p').textContent); // Big
	console.log(footer.querySelector('p').textContent); // Small

This means that we are able to operate in specific part of the DOM tree and our class should support passing of scope. So, together with selector it will be good if it accepts a parent element.

	var dom = function(el, parent) {
		var api = { el: null }
		api.val = function(value) {
			// ...
		}
		return api;
	}

## Reaching the DOM element

As we said above we are going to use <i>querySelector</i> and <i>querySelectorAll</i> to reach the DOM elements. Let's create two shortcuts for these functions.

	var qs = function(selector, parent) {
	    parent = parent || document;
	    return parent.querySelector(selector);
	};
	var qsa = function(selector, parent) {
	    parent = parent || document;
	    return parent.querySelectorAll(selector);
	};

After that we should use the passed <i>el</i> argument. Normally this will be a string (selector) but we may support:

* DOM element - the <i>val</i> method of the class will be pretty handy so we may need to use the class with already referenced element
* A JavaScript object - in order to create JavaScript object containing multiple DOM elements

The following switch will cover both cases:

	switch(typeof el) {
		case 'string':
			parent = parent && typeof parent === 'string' ? qs(parent) : parent;
			api.el = qs(el, parent);
		break;
		case 'object': 
			if(typeof el.nodeName != 'undefined') {
	            api.el = el;
	        } else {
	        	var loop = function(value, obj) {
            		obj = obj || this;
            		for(var prop in obj) {
        				if(typeof obj[prop].el != 'undefined') {
        					obj[prop] = obj[prop].val(value);
        				} else if(typeof obj[prop] == 'object') {
        					obj[prop] = loop(value, obj[prop]);
        				}
            		}
            		delete obj.val;
            		return obj;
	        	}
	            var res = { val: loop };
	            for(var key in el) {
	                res[key] = dom.apply(this, [el[key], parent]);
	            }
	            return res;
	        }
		break;
	}

The first case is executed if the developer passes a string. We prepare the parent and call the <i>querySelector</i> shortcut. The second part of the statement is for the cases where we have a DOM element sent or a JavaScript object. We are checking if the object has <i>nodeName</i> property, and if yes then we directly apply it as a value of the <i>api.el</i> property. If not then we go through all the parts of the object and initialize a class instance for every property. Here are some test cases involving the following markup:

	<p>text</p>
	<header>
		<p>Big</p>
	</header>
	<footer>
		<p>Small</p>
	</footer>

Accessing the first paragraph:

	dom('p').el

Accessing the paragraph in the <i>header</i> node:

	dom('p', 'header').el

Passing a DOM element:

	dom(document.querySelector('header')).el

Passing JavaScript object:

	var els = dom({
		footer: 'footer',
		paragraphs: {
			header: 'header p',
			footer: 'footer p'
		}
	}))
	// At the end we have again JavaScript object.
	// It's properties are actually results
	// of dom function execution. For example, to get
	// the paragraph in the footer:
	els.paragraphs.footer.el

## Getting or setting the value of an element

The value of the form elements like <i>input</i> or <i>select</i> could be retrieve easily - we may use the <i>value</i> property of the element. And we already have an access to the DOM element - it is stored in <i>api.el</i>. However, it is a little bit tricky when we are working with radio or check boxes. For the other HTML nodes like divs, sections or spans for example we need to get the value of the <i>textContent</i> property. If there is no <i>textContent</i> defined then <i>innerHTML</i> will produce similar results. Let's use again a <i>switch</i> statement:

	api.val = function(value) {
		if(!this.el) return null;
		var set = !!value;
		var useValueProperty = function(value) {
			if(set) { this.el.value = value; return api; }
			else { return this.el.value; }
		}
        switch(this.el.nodeName.toLowerCase()) {
        	case 'input':
        	break;
        	case 'textarea':
        	break;
        	case 'select':        		
        	break;
        	default:
        }
        return set ? api : null;
	} 

First of all we should have <i>api.el</i> defined. The variable <i>set</i> is a boolean telling us if we are retrieving or setting the value of the element. There is a helper method defined for those elements which have <i>.value</i> property. The <i>switch</i> will contain the actual logic of the method. At the end we are returning the API itself in order to chain the methods of the class. Of course we are doing this only if we are using the function as a setter.

Let's see how to handle the different types of elements. For example the <i>input</i> node:

	case 'input':
		var type = this.el.getAttribute('type');
		if(type == 'radio' || type == 'checkbox') {
            var els = qsa('[name="' + this.el.getAttribute('name') + '"]', parent);
            var values = [];
            for(var i=0; i<els.length; i++) {
                if(set && els[i].checked && els[i].value !== value) {
                    els[i].removeAttribute('checked');
                } else if(set && els[i].value === value) {
                	els[i].setAttribute('checked', 'checked');
                	els[i].checked = 'checked';
                } else if(els[i].checked) {
                	values.push(els[i].value);
                }
            }
            if(!set) { return type == 'radio' ? values[0] : values; }
        } else {
        	return useValueProperty.apply(this, [value]);
        }
	break;

This is maybe the most interesting case. There are two types of elements which need to be process differently - radio and check boxes. These elements are grouped into sets and we need to have this in mind. That's why we are using <i>querySelectorAll</i> to fetch the whole group and find out which one is selected/checked. It's even more complex, because a group of check boxes could have more then one value. The method above successfully handles all these situations.

The processing of <i>textarea</i> element is pretty simple thankfully to the helper which we wrote above.

	case 'textarea': 
		return useValueProperty.apply(this, [value]); 
	break;

Handling of a drop down:

	case 'select':
		if(set) {
    		var options = qsa('option', this.el);
    		for(var i=0; i<options.length; i++) {
    			if(options[i].getAttribute('value') === value) {
    				this.el.selectedIndex = i;
    			} else {
    				options[i].removeAttribute('selected');
    			}
    		}
    	} else {
        	return this.el.value;
    	}
	break;

Processing of everything else:

	default: 
		if(set) {
			this.el.innerHTML = value;
		} else {
    		if(typeof this.el.textContent != 'undefined') {
                return this.el.textContent;
            } else if(typeof this.el.innerText != 'undefined') {
                return typeof this.el.innerText;
            } else {
                return this.el.innerHTML;
            }
    	}
	break;

With these lines of code we are finishing our <i>val</i> method. Here is a short HTML form and its corresponding test:

	<form>
		<input type="text" value="sample text" />
		<input type="radio" name="options" value="A">
		<input type="radio" name="options" checked value="B">
		<select>
			<option value="10"></option>
			<option value="20"></option>
			<option value="30" selected></option>
		</select>
		<footer>version: 0.3</footer>
	</form>

If we use the following code:

	dom({
		name: '[type="text"]',
		data: {
			options: '[type="radio"]',
			count: 'select'
		},
		version: 'footer'
	}, 'form').val();

We will get:

	{
		data: {
			count: "30",
			options: "B"
		},
		name: "sample text",
		version: "version: 0.3"
	}

This method could be really helpful if you want to translate a data from HTML form into JavaScript object. It's actually pretty common task and I'm sure that we are doing this almost every day.

## Final result

The produced class is only 100 lines of code. We could use it to access DOM elements, to get or set their value/content.

	var dom = function(el, parent) {
		var api = { el: null }
		var qs = function(selector, parent) {
		    parent = parent || document;
		    return parent.querySelector(selector);
		};
		var qsa = function(selector, parent) {
		    parent = parent || document;
		    return parent.querySelectorAll(selector);
		};
		switch(typeof el) {
			case 'string':
				parent = parent && typeof parent === 'string' ? qs(parent) : parent;
				api.el = qs(el, parent);
			break;
			case 'object': 
				if(typeof el.nodeName != 'undefined') {
		            api.el = el;
		        } else {
		        	var loop = function(value, obj) {
	            		obj = obj || this;
	            		for(var prop in obj) {
	        				if(typeof obj[prop].el != 'undefined') {
	        					obj[prop] = obj[prop].val(value);
	        				} else if(typeof obj[prop] == 'object') {
	        					obj[prop] = loop(value, obj[prop]);
	        				}
	            		}
	            		delete obj.val;
	            		return obj;
		        	}
		            var res = { val: loop };
		            for(var key in el) {
		                res[key] = dom.apply(this, [el[key], parent]);
		            }
		            return res;
		        }
			break;
		}
		api.val = function(value) {
			if(!this.el) return null;
			var set = !!value;
			var useValueProperty = function(value) {
				if(set) { this.el.value = value; return api; }
				else { return this.el.value; }
			}
	        switch(this.el.nodeName.toLowerCase()) {
	        	case 'input':
	        		var type = this.el.getAttribute('type');
	        		if(type == 'radio' || type == 'checkbox') {
		                var els = qsa('[name="' + this.el.getAttribute('name') + '"]', parent);
		                var values = [];
		                for(var i=0; i<els.length; i++) {
		                    if(set && els[i].checked && els[i].value !== value) {
		                        els[i].removeAttribute('checked');
		                    } else if(set && els[i].value === value) {
		                    	els[i].setAttribute('checked', 'checked');
		                    	els[i].checked = 'checked';
		                    } else if(els[i].checked) {
		                    	values.push(els[i].value);
		                    }
		                }
		                if(!set) { return type == 'radio' ? values[0] : values; }
		            } else {
		            	return useValueProperty.apply(this, [value]);
		            }
	        	break;
	        	case 'textarea': 
	        		return useValueProperty.apply(this, [value]); 
	        	break;
	        	case 'select':
	        		if(set) {
	            		var options = qsa('option', this.el);
	            		for(var i=0; i<options.length; i++) {
	            			if(options[i].getAttribute('value') === value) {
	            				this.el.selectedIndex = i;
	            			} else {
	            				options[i].removeAttribute('selected');
	            			}
	            		}
	            	} else {
	                	return this.el.value;
	            	}
	        	break;
	        	default: 
	        		if(set) {
	        			this.el.innerHTML = value;
	        		} else {
		        		if(typeof this.el.textContent != 'undefined') {
			                return this.el.textContent;
			            } else if(typeof this.el.innerText != 'undefined') {
			                return typeof this.el.innerText;
			            } else {
			                return this.el.innerHTML;
			            }
		        	}
	        	break;
	        }
	        return set ? api : null;
		}
		return api;
	}

[Here](http://jsbin.com/locap/5/embed?html,js,console) is a jsbin to play with.

## Summary

The class above is part of [AbsurdJS client-side components](http://absurdjs.com/pages/client-side-components/). The full documentation of the module could be found [here](http://absurdjs.com/pages/api/build-in-components/#dom). The aim of the code is not to replace jQuery or the dozen popular available libraries. The idea of the function is to be independent, to do only one thing and to do it well. Which is the main concept behind [AbsurdJS](http://absurdjs.com/) and its build-in modules like the [router](http://absurdjs.com/pages/api/build-in-components/#router) or [Ajax](http://absurdjs.com/pages/api/build-in-components/#ajax) wrapper.