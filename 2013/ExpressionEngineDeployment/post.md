# Deploying ExpressionEngine based site

I found [ExpressionEngine](http://ellislab.com/expressionengine) framework very good. It brings the flexibility which I need and still has a good amount of features. However, as many other similar tools, the deployment could be a little bit difficult.

In our case the source code of the project is hosted in internal Git server. We have three development environments:
  - staging - the client reviews the site there before changes go live
  - production - that's the official live version of the site
  - local - every developer has its own version of the site on his local machine

The main goal was to deploy very fast and keep the site like that so it can be setup on a new server in a few minutes. We also follow [continuous integration](http://en.wikipedia.org/wiki/Continuous_integration) practice. I.e. we are doing this very often on our development machines. That's actuall keeps a good state of the project and assures any future migrations.

## Configuration

EE keeps a lot of things in the database, which is not good, because every time when some of the programmers make a change in the control panel, this correction stays only on his machine. No matter if he commits the project's files, the settings are still in his local mysql database. The guys from [Focus Lab](http://focuslabllc.com/) share their awesome EE configuration setup. It is available [here](https://github.com/focuslabllc/ee-master-config) and we decided to use it. There are two key moments in this solution.

  - the most important settings of EE are placed in php files, which is great because we can commit them in the repository and all the team mates are able to pull the changes.
  - the setup gives ability to define different configuration files for different domains, i.e. different development environments.

Shortly our *config* folder looks like that:

	/config
		/config.env.php
		/config.local.php
		/config.local.sample.php
		/config.master.php
		/config.prod.php
		/config.stage.php

There are two files from the EE's core which are patched:

	/system/expressionengine/config/config.php
	/system/expressionengine/config/database.php

They both require *config.master.php*, which loads *config.env.php*. That's the moment where the system decides which file to use:

	if ( ! defined('ENV')) {
		switch (strtolower($_SERVER['HTTP_HOST'])) {
			case 'domain.com' :
				define('ENV', 'prod');
				define('ENV_FULL', 'Production');
				define('ENV_DEBUG', FALSE);
			break;
			case 'staging.domain.com' :
				define('ENV', 'stage');
				define('ENV_FULL', 'Staging');
				define('ENV_DEBUG', FALSE);
			break;
			default :
				define('ENV', 'local');
				define('ENV_FULL', 'Local');
				define('ENV_DEBUG', FALSE);
			break;
		}
	}

Based on *ENV* variable EE injects one of the files in */config* directory. *config.master.php* contains some other useful options, which doesn't depend of the current environment. 

We added a *config.local.sample.php* file, because *config.local.php* is Git ignored and every new coder should see how this file must looks like. 

At the end, the project could be setup without any actions in the administration area. I.e. simply by fetching the code from the version control and changing few settings in the files above. It's also a good practice to use virtual host for the local development. And this host to be identical for all the developers. Ours looks like that (Apache): 

	<VirtualHost *:80>
	    DocumentRoot "path to files"
	    ServerName projectname.dev
	    ServerAlias www.projectname.dev
	    <Directory "path to files">
	        Options Indexes FollowSymlinks
	        AllowOverride All
	        Order allow,deny
	        Allow from all
	    </Directory>
	</VirtualHost>

## Database migration

Ok, that's a tough one. The major settings are in php files, but what about database schema changes. And in EE we have a lot of them. Every time when we make a new channel or install a new channel field type we are changing the database structure. We add new records to specific tables or alter them by adding/removing new columns. There are several solutions available, but I came with my own.

### The non-cool way

You record all the things that you do in the control panel. In a simple text file or screen capture video. Commit the file in the repository and instruct your colleagues that they should perform the same actions. Of course together with all those things you should repeat the steps on your staging and production environments. 

There is no need to say that this workflow is not efficient at all. You will lose a lot of time, and of course there is a big chance to mess the things up.

### The better way

You make the corrections directly no your production server, dump the whole database and distribute it to the other environments. Following this approach you are sure that everything is ok on the production server (at least). And of course, after a quick import you will have all the things correctly placed. There are several disadvantages which I want to point out:

  - Everything which is on the production server will come to the other versions of the site. Sometimes there is some things which you don't need.
  - If there is a configuration added in the production database, those things will also arrive. Which is kinda bad, because you will have to know the exact settings and of course fix them accordingly.
  - If you have something special added on the local database, you will lose it during the import

### My way

I have several servers and every one of them has its own database. There are changes in my local database which I have to transfer to the others. I don't need to export/import the whole database. I need only the latest changes which I've just made. Ok so ... if I inject some code just before to send something to the mysql I'll be able to log all the queries. Doing this I'll have the exact requests to the database and will be able to execute them on the other machines. I searched for *mysql_query* in the whole project and luckily there are only two places where this method pops up.

	Searching 2284 files for "mysql_query"

	\system\codeigniter\system\database\drivers\mysql\mysql_driver.php:
	  144  		if ($this->use_set_names === TRUE)
	  145  		{
	  146: 			return @mysql_query("SET NAMES '".$this->escape_str($charset)."' COLLATE ...
	  147  		}
	  148  		else
	  ...
	  179  		$sql = $this->_prep_query($sql);
	  180: 		return @mysql_query($sql, $this->conn_id);
	  181  	}
	  182  

	2 matches in 1 file

The first one is *SET NAMES ...* which is not very interesting, but the second one is actually the place where I have to put my code. I also checked if EE uses [PDO](http://php.net/manual/en/book.pdo.php), but that wasn't the case here. I wrote a simple php class, which accepts the query and send it to a static file:

	// DBLogger.php

	class DBLogger {

		private $enabled;
		private $operations;
		private $ignoredTables;

		public function __construct() {
			$this->enabled = false;
			$this->operations = null;
			$this->ignoredTables = null;
		}
		public function enable() {
			$this->enabled = true;
			return $this;
		}
		public function disable() {
			$this->enabled = false;
			return $this;
		}
		public function operations($operations) {
			$this->operations = $operations;
			return $this;
		}
		public function ignoreTables($tables) {
			$this->ignoredTables = $tables;
			return $this;
		}
		public function log($query) {	
			if(!$this->enabled) return;
			$queryParts = explode(" ", $query);
			$queryCommand = $queryParts[0];
			if($this->operations === null || strripos($this->operations, $queryCommand) !== false) {
				$tables = $this->ignoredTables === null ? array() : explode(",", $this->ignoredTables);
				$numOfTables = count($tables);
				for($i=0; $i<$numOfTables; $i++) {
					$tableName = str_replace(" ", "", $tables[$i]);
					if(strpos($query, $tableName) !== false) {
						return;
					}
				}
				$file = "queries_".date("Y-d-m").".sql";
				$this->writeToFile($file, $query);
			}
			return $this;
 		}
 		private function writeToFile($file, $query) {
 			$dir = dirname(__FILE__)."/logs/";
 			$content = '';
 			if(file_exists($dir.$file)) {
 				$content = file_get_contents($dir.$file)."\n\n";
 			}
 			$content .= $query.";";
 			file_put_contents($dir.$file, $content);
 		}
	}

	global $dblogger;
	$dblogger = new DBLogger();

Maybe it's not the best implementation, but till now it does its job. The class has four features:

  - It stores mysql queries in a static file, like for example *queries_2013-25-06.sql*.
  - It provides a mechanism for enabling and disabling.
  - It provides method for excluding tables. That's necessary, because there are some requests about session storing or something like. Things which we don't need.
  - It filters the type of requests. I.e. there is no need to log *SELECT* queries.

Place the file wherever you want. You have to include it on three places.

  - */index.php*
  - */admin.php*
  - */system/codeigniter/system/database/drivers/mysql/mysql_driver.php*

Open */system/codeigniter/system/database/drivers/mysql/mysql_driver.php*, find *_execute* method and change it to looks like that:

	function _execute($sql)
	{
		global $dblogger;
		$sql = $this->_prep_query($sql);
		$dblogger->log($sql);
		return @mysql_query($sql, $this->conn_id);
	}

Now every mysql query will be send to the *DBLogger*. Of course you don't want to write every single request. That's why I enable the *DBLogger* only when I'm making changes in the database schema. Like for example adding a new channel, or changing some settings in the control panel. The enabling should be placed in *admin.php* file. Normally the code snippet looks like that:

	require_once dirname(__FILE__).'/path-to-the-file/DBLogger.php';
	// $dblogger
	// ->enable()
	// ->operations('CREATE, INSERT, UPDATE, ALTER, DROP, DELETE, LOAD')
	// ->ignoreTables('smliiga_security_hashes, smliiga_sessions');

When I want to enable logging I simple uncomment the lines:

	require_once dirname(__FILE__).'/path-to-the-file/DBLogger.php';
	$dblogger
	->enable()
	->operations('CREATE, INSERT, UPDATE, ALTER, DROP, DELETE, LOAD')
	->ignoreTables('smliiga_security_hashes, smliiga_sessions');

Once everything is setup up, our flow is:

  1. Make some changes in the files of the project
  2. Enable logging in *admin.php*
  3. Make some changes in the control panel
  4. Disable the logging
  5. Find out the newly created file and rename it to something meaningful. I mean it's not a good idea to leave the file with name *queries_2013-25-06.sql*. It's much better to be *adding-news-channel.sql* or something like that
  6. Commit the files
  7. Execute the queries on the development and production servers
  8. Test 

  We moved the things a little bit further and create a simple tool, which checks the current created log files and tells which file is executed or not.

  There is one another benefit - we don't export the whole database when we need to setup the project on a new place. We are starting with absolutely clean EE database state and simple execute all the queries from the log files.
