# Cross-browser handling of Ajax requests

This blog post is part of series about [AbsurdJS](http://absurdjs.com/). I'll continue filling the library with small and self organized black boxes. In the last article we talked about [creating a JavaScript router](http://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url). This time we will go through the process of making Ajax requests. 

## Requirements

The created class should ...

* be less then 100 lines
* supports GET, POST, PUT and DELETE requests
* supports passing of parameters
* handles JSON loading
* provides API for adding custom HTTP headers
* works under all modern browsers (including IE)

## The beginning

As with the [router](http://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url), let's to use the [singleton](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#singletonpatternjavascript) pattern.

	var Ajax = {
	    request: function(ops) {
	        // ...
	    }
	}

There will be only one method - <i>request</i>. It will perform the Ajax request by accepting the needed options. It will return a promise so its usage will look like that:

	Ajax
	.request('data.php')
	.done(function(result) {
	    // ...
	})
	.fail(function(xhr) {
	    // ...
	});

## Options

Before to proceed with the implementation of the actual request let's prepare the needed settings.

	if(typeof ops == 'string') ops = { url: ops };
	ops.url = ops.url || '';
	ops.method = ops.method || 'get'
	ops.data = ops.data || {};

In general we want to pass an object as value of <i>ops</i>. But very often we need to make a simple GET request and the only one setting is the URL of the data source. In such cases we may accept directly the URL. That's what the first line above do. The code after that just sets default values. <i>data</i> will contain the parameters which we need to be passed along with the request (if any).

## Returning the promise

Normally while I'm constructing my modules I'm attaching the public methods and properties to an object which I call <i>api</i>. Later this object is returned and that's what the outside world sees. This approach helps me to isolate logic or variables which are needed only for the internal processes.

	var Ajax = {
	    request: function(ops) {
	        if(typeof ops == 'string') ops = { url: ops };
	        ops.url = ops.url || '';
	        ops.method = ops.method || 'get'
	        ops.data = ops.data || {};
	        var api = {
	            host: {},
	            process: function(ops) {
	                // ... the magic
	                return this;
	            },
	            done: function(callback) {
	                this.doneCallback = callback;
	                return this;
	            },
	            fail: function(callback) {
	                this.failCallback = callback;
	                return this;
	            },
	            always: function(callback) {
	                this.alwaysCallback = callback;
	                return this;
	            }
	        }
	        return api.process(ops);
	    }
	}

The <i>api</i> implements the promise-like interface. Notice that every method returns <i>this</i>. This will help us chaining the functions. There is another useful thing - the <i>host</i> property. It is clear that at the end we need to call the <i>doneCallback</i>, <i>failCallback</i> or <i>alwaysCallback</i> callbacks. However it is good to make this in certain scope. I don't like doing this:

	var self = this;
	$.getJSON( "ajax/test.json", function(data) {
		this.processTheResult(data);
	});

So, if the callback is called with specific scope we don't need to define variables like <i>self</i>.

## Creating <i>XMLHttpRequest</i> object

The <i>XMLHttpRequest</i> object is in the center of the whole process. Without it we can't make a HTTP request. Under IE it is created differently, but its API is thankfully the same.

	process: function(ops) {
	    var postBody = '', self = this;
	    this.xhr = null;
	    if(window.ActiveXObject) { this.xhr = new ActiveXObject('Microsoft.XMLHTTP'); }
	    else if(window.XMLHttpRequest) { this.xhr = new XMLHttpRequest(); }
	    if(this.xhr) {
	        // fire the request 
	    }
	    return this;
	}

## Getting feedback about the request

This is done in a function which we assign to the <i>onreadystatechange</i> property. 

	if(this.xhr) {
        this.xhr.onreadystatechange = function() {
            if(self.xhr.readyState == 4 && self.xhr.status == 200) {
                var result = self.xhr.responseText;
                if(ops.json === true && typeof JSON != 'undefined') {
                    result = JSON.parse(result);
                }
                self.doneCallback && self.doneCallback.apply(self.host, [result, self.xhr]);
            } else if(self.xhr.readyState == 4) {
                self.failCallback && self.failCallback.apply(self.host, [self.xhr]);
            }
            self.alwaysCallback && self.alwaysCallback.apply(self.host, [self.xhr]);
        }
    }

There are two things which we are interesting in - <i>readyState</i> and <i>status</i>. <i>readyState</i> is 0 when the request is still not sent, 1 when the request is opened, 2 when the headers are received, 3 when the request is in progress and 4 when everything is done. Even if the request finishes successfully we should check the <i>status</i> property of the <i>XMLHttpRequest</i> object. If it is 200 then everything is ok, otherwise something goes wrong. I'll suggest to check out the following [page](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) for more information regarding the HTTP response codes. The rest of the code above is just handling the response. If <i>ops.json</i> is set to <i>true</i> then we are using <i>JSON.parse</i> to retrieve the actual JSON object.

## Sending the request

Here is the code needed for triggering the request.

	if(ops.method == 'get') {
		this.xhr.open("GET", ops.url + getParams(ops.data, ops.url), true);
	} else {
		this.xhr.open(ops.method, ops.url, true);
		this.setHeaders({
			'X-Requested-With': 'XMLHttpRequest',
			'Content-type': 'application/x-www-form-urlencoded'
		});
	}
	if(ops.headers && typeof ops.headers == 'object') {
		this.setHeaders(ops.headers);
	}		
	setTimeout(function() { 
		ops.method == 'get' ? self.xhr.send() : self.xhr.send(getParams(ops.data)); 
	}, 20);

The <i>XMLHttpRequest</i> has two methods which we need to call - <i>open</i> and <i>send</i>. In the first one we have to set the type of the request. If we need a GET request then the value should be <i>GET</i> for POST requests <i>POST</i> and so on. The second argument is the URL. The parameters come to the class as a hash. I.e. an object with key-value pairs. <i>getParams</i> is a function which converts the object to a string.

	var getParams = function(data, url) {
		var arr = [], str;
		for(var name in data) {
			arr.push(name + '=' + encodeURIComponent(data[name]));
		}
		str = arr.join('&');
		if(str != '') {
			return url ? (url.indexOf('?') < 0 ? '?' + str : '&' + str) : str;
		}
		return '';
	}

It checks if the question mark is not already in the URL and appends all parameters with ampersand symbol. The last argument of the <i>open</i> method is a boolean telling to the browser if the request is asynchronous or not. In most of the cases we want to perform asynchronous call so <i>true</i> should be set. As you can see the POST, DELETE and PUT methods need few headers to be set. Of course that's not mandatory, but it is a good practice. The others, custom headers are done in another method - <i>setHeaders</i>.

	setHeaders: function(headers) {
		for(var name in headers) {
			this.xhr && this.xhr.setRequestHeader(name, headers[name]);
		}
	}

At the end <i>send</i> fires the request. If the method is POST, PUT or DELETE the function accepts a string representing the parameters. The <i>setTimeout</i> is needed because there is a bug under IE related to the setting of the headers.

## The final result

Here is the finished class in all its glory.

	var Ajax = {
	    request: function(ops) {
	        if(typeof ops == 'string') ops = { url: ops };
	        ops.url = ops.url || '';
	        ops.method = ops.method || 'get'
	        ops.data = ops.data || {};
	        var getParams = function(data, url) {
	            var arr = [], str;
	            for(var name in data) {
	                arr.push(name + '=' + encodeURIComponent(data[name]));
	            }
	            str = arr.join('&');
	            if(str != '') {
	                return url ? (url.indexOf('?') < 0 ? '?' + str : '&' + str) : str;
	            }
	            return '';
	        }
	        var api = {
	            host: {},
	            process: function(ops) {
	                var self = this;
	                this.xhr = null;
	                if(window.ActiveXObject) { this.xhr = new ActiveXObject('Microsoft.XMLHTTP'); }
	                else if(window.XMLHttpRequest) { this.xhr = new XMLHttpRequest(); }
	                if(this.xhr) {
	                    this.xhr.onreadystatechange = function() {
	                        if(self.xhr.readyState == 4 && self.xhr.status == 200) {
	                            var result = self.xhr.responseText;
	                            if(ops.json === true && typeof JSON != 'undefined') {
	                                result = JSON.parse(result);
	                            }
	                            self.doneCallback && self.doneCallback.apply(self.host, [result, self.xhr]);
	                        } else if(self.xhr.readyState == 4) {
	                            self.failCallback && self.failCallback.apply(self.host, [self.xhr]);
	                        }
	                        self.alwaysCallback && self.alwaysCallback.apply(self.host, [self.xhr]);
	                    }
	                }
	                if(ops.method == 'get') {
	                    this.xhr.open("GET", ops.url + getParams(ops.data, ops.url), true);
	                } else {
	                    this.xhr.open(ops.method, ops.url, true);
	                    this.setHeaders({
	                        'X-Requested-With': 'XMLHttpRequest',
	                        'Content-type': 'application/x-www-form-urlencoded'
	                    });
	                }
	                if(ops.headers && typeof ops.headers == 'object') {
	                    this.setHeaders(ops.headers);
	                }       
	                setTimeout(function() { 
	                    ops.method == 'get' ? self.xhr.send() : self.xhr.send(getParams(ops.data)); 
	                }, 20);
	                return this;
	            },
	            done: function(callback) {
	                this.doneCallback = callback;
	                return this;
	            },
	            fail: function(callback) {
	                this.failCallback = callback;
	                return this;
	            },
	            always: function(callback) {
	                this.alwaysCallback = callback;
	                return this;
	            },
	            setHeaders: function(headers) {
	                for(var name in headers) {
	                    this.xhr && this.xhr.setRequestHeader(name, headers[name]);
	                }
	            }
	        }
	        return api.process(ops);
	    }
	}

And its usage:

	Ajax
	.request({
	    url: 'data.php',
	    method: 'post',
	    data: {
	        select: 'users',
	        orderBy: 'date'
	    },
	    headers: {
	        'custom-header': 'custom-value'
	    }
	})
	.done(function(result) {
	    console.log("done", result);
	})
	.fail(function(xhr) {
	    console.log("fail");
	})
	.always(function(xhr) {
	    console.log("always");
	});

## Summary

Sometimes you don't need to add a whole library or framework just to handle Ajax requests. Such small modules not only save few kilobytes, but are also easy for testing. Like in our case, as I said this class is part of [AbsurdJS](http://absurdjs.com/) and has its own [test suite](http://absurdjs.com/tests/?spec=Testing%20components%20(ajax)).