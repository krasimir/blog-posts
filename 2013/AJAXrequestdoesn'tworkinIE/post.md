# AJAX request doesn't work in IE 

The *good* old Internet Explorer. It's full with surprises. I just fixed a bug happening only in IE. Everything works just great in every other browser.

## The story

I have a simple mobile site, which makes Ajax requests to an external REST API. Some part of the application works, but others not. I noticed that the problematic requests contain JSON. I.e. something like:

	/api/get/list?filter={"approved":1,"eventId":"4f86ca35fd33d9a55a000001"}&token=EC46FADECA4C

In Google Chrome, the actual request string looks like that:

	/api/get/list?filter={%22approved%22:1,%22eventId%22:%224f86ca35fd33d9a55a000001%22}&token=EC46FADECA4C

The backend understand the query, parses it and returns a proper result. However, without correct url encoding the things are not working. So, during the url preparation I replaced 

	url += JSON.stringify(parameter);

with

	url += encodeURIComponent(JSON.stringify(parameter));

And the problem is fixed. Now even the crappy IE works.