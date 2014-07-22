## Documentation
Maybe the most important thing in every software nowadays - the [documentation](http://ellislab.com/expressionengine/user-guide/). The one of ExpressionEngine is well formated and I enjoy reading it because most of the sections are short. From other point of view it's a great resource for the core functionalities. What I'm doing every time when I have to start working with a new framework is to go over the whole documentation. Of course I'm not reading every section or every paragraph. I just check what is available. This time the process took just few hours, which normally happens in few days. The documentation is somehow divided to two parts - a basic overview and more detailed technical overview. It's a good decision, because I need to know what I can do with the framework and after that to find out how to do it.

## An example
There is a [part of the documentation](http://ellislab.com/expressionengine/user-guide/how_to/building_a_simple_news_site.html) which presented a simple application. I.e. step by step guide to create a basic web site. It is nice that there is such a short way to get rough idea of how the framework works. The installation of the framework is also an easy process. I didn't touch anything in my local environment and everything just worked.

## Basics
Based on my short researching I could tell that there are several big things in ExpressionEngine - channels, entries and templates. The content of that CMS is organized in channels, which are presented by using different templates. The channels are filled with entries, which are basically your data. Surprisingly well designed is the [routing logic](http://ellislab.com/expressionengine/user-guide/urls/url_structure.html). It's nicely defined and it is clear what you are opening/expecting from a specific url.
	
	http://example.com/index.php/template_group/template/entryid

## Codebase

So far I didn't check the code of the framework at all. I only read the documentation and did some stuff with the control panel. It's time to check what stands behind the curtain. What I don't like most of all in the big frameworks is the complex codebase. It should be really clear what is going on. If I want to follow the application logic I should be able to do this fast. I completely understand that if we want more features the code can not be so simple. However I still think that everything could be written in a simple matter. My first impression looking the code of ExpressionEngine is good. The files are in meaningful directories and there are comments all over the source. 

## Implementation journey
In this part of the research I'll try to simulate a real usage of the framework. I.e.:

  - Creating a new web page with static content 
  - Adding static javascript and css 
  - Adding dynamic content to the page
  - Creating a space for absolutely independent page. I.e. something which is not related to ExpressionEngine.
  - Showing information to the user coming from a custom php code

### Creating a new web page with static content
First I read [this page](http://ellislab.com/expressionengine/user-guide/templates/templates_as_files.html). I create a new folder in the main work project and set the *Server path to site's templates* option pointing to this directory. This step along with allowing "Save Templates as Files" creates a private space for my experiment. Because I made the little *Hello world* application ExpressionEngine automatically adds *default_site* folder and all the created template groups with their *index.html* templates. Without to use the control panel I create *Custom.group* folder and put two html files there - *index.html* and *about.html*. After page reload in the Template manager I got the following screen:

![Template manager](http://krasimirtsonev.com/blog/articles/ExpressionEngineOverview/ee-templatemanager.jpg)

My new pages are also available at

	http://example.com/index.php/Custom/
	http://example.com/index.php/Custom/about

So, mapping of templates to routes is easy. What makes me a little bit unhappy is the fact that I had to set the full server path to the templates. A path which probably will be different on every machine.

### Adding static javascript and css 
Intuitively I create folder *Custom.group/css* and put *styles.css*. However I'm not able to access the file. So, I have to create a new template group and put the files there.

![Template manager](http://krasimirtsonev.com/blog/articles/ExpressionEngineOverview/ee-templatemanager2.jpg)

Maybe I didn't read enough of the documentation, but it looks like I should keep my javascript and css out of the framework's directories. Which is actually good :) I simply create *assets* folder in the main project's directory and put everything there - .js and .css files.

### Adding dynamic content to the page 

I have *about* page at 

	http://example.com/index.php/Custom/about

And I want to manage it via the control panel. I have to add a new channel for that, so I open *Admin > Channel administration > Cannels* and click on *Create a New Channel*.

![Template manager](http://krasimirtsonev.com/blog/articles/ExpressionEngineOverview/ee-newchannel.jpg)

As you may notice I leave *Channel Field Group* to *None*. By doing this I'll have only the default *Title* and *URL* as fields for every entry in this channel. 

![Template manager](http://krasimirtsonev.com/blog/articles/ExpressionEngineOverview/ee-newentry.jpg)

The typical *About* page contains few long paragraphs of text. The title and the url are not enough so I have to great a *Field Group* specifically for that. The administration of the fields is available in  *Admin > Channel administration > Cannels Fields*. A Textarea (Rich Text) field is required in the new group. Once this is ready I edit the group assignments of the *About* channel and all the job in the control panel is done. Adding a new entry brings nice rich-text area for my information.

![Template manager](http://krasimirtsonev.com/blog/articles/ExpressionEngineOverview/ee-newentry2.jpg)

Of course I add a new entry and what I have to do now is to open my template and place the channel entries tag:

	<h1>About page</h1>
	<p>
		{exp:channel:entries channel="about"}
		    {about_text}
		{/exp:channel:entries}
	</p>

Overall, I like the workflow of adding dynamic content. It's flexible enough and doesn't involve any PHP coding. 

### Creating a space for absolutely independent page. I.e. something which is not related to ExpressionEngine.
ExpressionEngine doesn't have a global .htaccess file (by default) which means that I'm able to create a new folder or file in the main directory and everything will work. It's also good that the custom code could use the configuration of the framework. For example if you need to connect to the database you should include 
	
	/system/expressionengine/config/database.php

Yes, it's a little bit tricky, because it contains a check in the beginning, which I guess tries to prevent such file usage. But it still works if you define *BASEPATH*:

	define("BASEPATH", dirname(__FILE__ ));
	require("../system/expressionengine/config/database.php");
	var_dump($db['expressionengine']);

In some of the widely used frameworks this is not so easy, because together with the configuration you have a lot of other includes. I.e. there are not only definition of settings, but *importing* of logic.

### Showing information to the user coming from a custom php code
Here I can't use the above approach. I should write something that outputs data in the templates used by the ExpressionEngine. In other words I have to define a custom tag. So, I should play by the rules of the framework. As far as I read in the documentation I'm able to create custom module, plugin or custom extension. I find the plugin creation interesting and I decided to take this way. Also it looks like the plugins have more capabilities. The documentation of the plugin development is available [here](http://ellislab.com/expressionengine/user-guide/development/plugins.html). I'm actually surprised of how easy is the process. Let's assume that I have to get a data from other source and serve it to the template. I need a plugin called *Remote data* which will eventually make a CURL request to remote server. I create a file called *pi.remote_data.php* and save it in *\system\expressionengine\third_party*.

	$plugin_info = array(
		'pi_name'			=> 'Remote data',
		'pi_version'		=> '1',
		'pi_author'			=> 'Krasimir Tsonev',
		'pi_author_url'		=> 'http://krasimirtsonev.com',
		'pi_description'	=> 'Testing ...'
	);

	class Remote_data  {  
		public $return_data = "";
		function Remote_data() {
			$this->return_data = "here is my data ...";
		}
	}

The plugin allows me to use the following tag in my templates:

	{exp:remote_data}

And of course outputs 

	here is my data ...

There are tons of helpful things that you can do inside your plugin. Processing the string inside your tag, accepting parameters, connecting to the database. Pretty much everything you need.

## Deployment
That's one of the most important points for me. I think that the good setup is a life-saver in many cases. If you have a fast and reliable deployment then you will be able to make changes quickly, which normally happens when the deadline is knocking on your door. The instructions [here](http://ellislab.com/expressionengine/user-guide/operations/moving.html) doesn't look very bad. As far as I can see, ExpressionEngine holds some settings in its database, which is not good. I know what could happen if you try to migrate WordPress, which also keeps a lot of things in its database. I would love to see more information about migration using some VCS like Git for example. No one (I hope) uses just a ftp. It will be helpful to know what should be ignored and what should be kept in the VCS. If you plan to use some framework in a project which is big and should be distributed between several developers then this point is kinda critical for you. If you are a fan (like me) of [Continuous integration](http://en.wikipedia.org/wiki/Continuous_integration) practice you know that it requires very good project setup. So, have this in mind when you choose your framework.

## Conclusion

Have in mind that during all the four tasks above I didn't mess with the ExpressionEngine's or CodeIgniter's code. This is huge advantage and I'll definitely give a try to this framework. The idea with the channels and fields' groups brings flexibility to the data management. The templates are also powerful and the fast development of plugins saves a lot of time. Overall, ExpressionEngine makes good first impression.



