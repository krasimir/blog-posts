# mod_rewrite, one simple rule and two stupidly lost hours

Ok, I should admit that mod&#95;rewrite and regular expressions are not my strongest part. Today - as every other day I realize how  little knowledge I have. Actually it's good to have such moments. I lost almost two hours fighting with a really really simple *mod&#95;rewrite* rule in my *.htaccess* file.[STOP]

Here is the scenario. I'm working on a [ExpressionEngine](http://ellislab.com/expressionengine) based project. I'm in charge with the back-end and one of my colleagues is responsible for the front-end stuff. He sliced the design and gave me the templates, .css, .js and image files. I decided to separate the assets from the templates and at the end my directory tree looks like that:

	/project
		/config
		/images/
		/public
			/ ... here are the .css, .js and image files
		/system
		/templates
			/ ... here are the html files
		/themes
		/admin.php
		/index.php
		/.htaccess

Everything works great except the fact that the paths to the things inside the *public* folder are actually referring the root directory. I.e. I had 

	<link rel="stylesheet" href="css/gumby.css">

But it had to be:

	<link rel="stylesheet" href="public/css/gumby.css">

I didn't want to change every single path so I decided to use *mod&#95;rewrite* to redirect all those request to the *public* directory. Even without this problem I had to use *.htaccess* file, because by default the urls of ExpressionEngine are in format

	http://example.com/index.php/template_group/template

But I wanted to be

	http://example.com/template_group/template

Anyway, in the EE's user guide I found the [exact syntax](http://ellislab.com/expressionengine/user-guide/urls/remove_index.php.html) to accomplish this. 

	<IfModule mod_rewrite.c>
        RewriteEngine On
        # Removes index.php from ExpressionEngine URLs
        RewriteCond $1 !\.(gif|jpe?g|png)$ [NC]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ /index.php/$1 [L]
	</IfModule>

Before to continue I commented all the rules and conditions. I just wanted to have a clear *.htaccess* file. As you will find out - that was my first mistake.

I know that there is a *favicon.png* file in the *public* directory so a request like 

	http://site.dev/favicon.png

should open the image. Of course I hit the url and saw:

	Object not found!
	The requested URL was not found on this server. If you entered the URL manually please check your spelling and try again.
	If you think this is a server error, please contact the webmaster.

Which is of course normal. I didn't do anything in the *.htaccess* file and there is no such a file in my root directory. I directly added the following line:

	RewriteRule ^(.*)\.(gif|jpg|png|jpeg|css|js|swf)$ /public/$1.$2 [L,NC]

Without to be an expert, I could say - match all the request starting with *everything* followed by one of those extensions and redirect them to */public* folder. At the end I added two flags meaning 

  - [L] - no further rules will be processed
  - [NC] - causes the RewriteRule to be matched in a case-insensitive manner

And load the url *http://site.dev/favicon.png* again and I got
	
	Internal Server Error
	The server encountered an internal error or misconfiguration and was unable to complete your request.

WTF! It should work! I tried a lot of things. I added new flags, changed the rule several times. Of course googled the problem. Read a lot of answers, but of course I didn't think about Apache's logs. That was my second mistake. If I had checked the damn file I wouldn't have lost so much time. There were several messages like this one:

	Request exceeded the limit of 10 internal redirects due to probable configuration error. Use 'LimitInternalRecursion' to increase the limit if necessary. Use 'LogLevel debug' to get a backtrace.

And here is the *A-ha* moment. *mod&#95;rewrite* worked as it should. The problem was that once I try to open */favicon.png* I was redirected to */public/favicon.png*, which is redirected to */public/public/favicon.png* and so on and so on. Or at least that's what I think happened. Once I knew the exact problem it was easy to find the solution. I added the following lines, which actually prevent the matching of my super cool rule if the file or directory physically exists.

	RewriteCond %{REQUEST_FILENAME} !-f
	RewriteCond %{REQUEST_FILENAME} !-d

Here is the full *.htaccess* file

	<IfModule mod_rewrite.c>
		RewriteEngine On

		RewriteCond %{REQUEST_FILENAME} !-f
		RewriteCond %{REQUEST_FILENAME} !-d
		RewriteRule ^(.*)\.(gif|jpg|png|jpeg|css|js|swf)$ /public/$1.$2 [L,NC]

		# Removes index.php from ExpressionEngine URLs	
		RewriteCond %{REQUEST_FILENAME} !-f
		RewriteCond %{REQUEST_FILENAME} !-d
		RewriteRule ^(.*)$ /index.php/$1 [L,QSA]

	</IfModule>

## Conclusion
Check your server's logs before to ask Google :)