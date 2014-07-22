# SASS and Node.js workflow

I'm writing a lot of JavaScript these days. Even if the project is not Node.js based I'm using it for processing some tasks. At the moment most of my projects use [GruntJS](http://gruntjs.com/). Today I spend some time adding [SASS](http://sass-lang.com/) to my workflow.

As you know SASS is a Ruby based CSS preprocessor. So, the very first thing that you should do is to install Ruby on your system. It's like every other software - the installation depends on the  type of your operating system. Once you are done you have to install SASS. Go to your console and type:

	gem install sass

This will set up SASS. Let's additionally add [Compass](http://compass-style.org/) - CSS authoring framework build on top of SASS.

	gem install compass

And now we are ready to write our <i>Gruntfile.js</i>.

	module.exports = function(grunt) {

		grunt.initConfig({
			sass: {
				dist: {
					options: {
						style: 'expanded'
					},
					files: {
						'path/to/css/test.css': 'path/to/sass/test.scss'
					}
			    }
			}
		});

		// loading modules
		grunt.loadNpmTasks('grunt-contrib-sass');

		grunt.registerTask('default', ['compass']);

	}

There is a GruntJS plugin made specifically for the purpose. It's called [grunt-contrib-sass](https://github.com/gruntjs/grunt-contrib-sass) and you have to add it to your <i>package.json</i> file as a dependency. In the code above, we pointed out our main <i>test.scss</i> file and the destination of the compiled CSS.

My current project uses [Gumby](http://gumbyframework.com/) framework, which is based on Compass. So, the above code will not work, because there are missing functionalities. We could change the script to:

	module.exports = function(grunt) {

		grunt.initConfig({
			compass: {
				dist: {
					options: {
						raw: "\
							require 'modular-scale'\n\
							project_path = '.'\n\
							preferred_syntax = :scss\n\
							css_dir = './css'\n\
							sass_dir = './sass'\n\
							images_dir = './images'\n\
							relative_assets = true\n\
							line_comments = false\n\
						"
					}
				}
			}
		});

		// loading modules
		grunt.loadNpmTasks('grunt-contrib-compass');

		grunt.registerTask('default', ['compass']);

	}

And again there is a module which takes care about compilation via Compass - [grunt-contrib-compass](https://github.com/gruntjs/grunt-contrib-compass). However that tool requires some configuration, which may be passed as property-value pairs into the <i>options</i> object. But in my case I had to add that <i>require 'modular-scale'</i> and I decided to use the <i>raw</i> property.