These days I spent some time working on [Yez!](https://github.com/krasimir/yez). Chrome extension whose main role is to replace the annoying switching between the terminal and the browser. It uses Node.js module to run shell commands. So, I had to deal with child processes, and I decided to document my experience.

## Running shell command

There are two methods for running child processes under Node.js - [exec](http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback) and [spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options). Here is an example of using the first one:

	var exec = require('child_process').exec;
	exec('node -v', function(error, stdout, stderr) {
	    console.log('stdout: ' + stdout);
	    console.log('stderr: ' + stderr);
	    if (error !== null) {
			console.log('exec error: ' + error);
	    }
	});

We are passing our command <i>node -v</i> as a first argument and expect to get response in the provided callback. <i>stdout</i> is what we normally need. That's the output of the command. <i>error</i> should be <i>null</i> if everything is ok. Let's see what will happen if we run the following failing script:

	// failing.js
	console.log('Hello!');
	throw new Error('Ops!')
	console.log('End!');

<i>stderr</i> contains the text of the error and <i>error</i> is an instance of <i>Error</i> class. So we may use <i>error.code</i> or <i>error.signal</i> to get more information about the problem.

The above <i>exec</i> snippet works for short-time commands. Processes whose job is to return a response immediately. However, I'm planning to use [Yez!](https://github.com/krasimir/yez) for much complex tasks like starting Gulp or Grunt tasks and monitoring their output. Or running a Node.js server and watching its logs. For example:

	// server.js
	var http = require('http');
	var visits = 0;
	http.createServer(function (req, res) {
		res.writeHead(200, {'Content-Type': 'text/plain'});
		visits += 1;
		var msg = 'Visits: ' + visits;
		res.end(msg + '\n'); console.log(msg);
		if(visits == 5) {
			process.exit();
		}
	}).listen(1337, '127.0.0.1');
	console.log('Server running at http://127.0.0.1:1337/');

	// script.js
	var exec = require('child_process').exec;
	exec('node ./server.js', function(error, stdout, stderr) {
	    console.log('stdout: ', stdout);
	    console.log('stderr: ', stderr);
	    if (error !== null) {
			console.log('exec error: ', error);
	    }
	});

We run <i>node ./script.js</i> which internally starts our server. It listens on localhost, port 1337. In order to stop the server we use a counter <i>visits</i>. We should request <i>http://127.0.0.1:1337</i> several times and see the following response in the terminal:

	stdout:  Server running at http://127.0.0.1:1337/
	Visits: 1
	Visits: 2
	Visits: 3
	Visits: 4
	stderr:

The problem is that we get the result when the process exits. The sentence saying that the server is running is sent to <i>stdout</i> stream, but because we have only one callback we get the result at the end. It's the same with the <i>console.log(msg)</i> messages. It won't work for my use case.

So, the better approach here will be to attach listeners to the <i>stdout</i> and <i>stderr</i>. There is also a <i>close</i> event available. Let's change our <i>script.js</i> file to the following code, that illustrates the idea:

	var exec = require('child_process').exec;
	var child = exec('node ./commands/server.js');
	child.stdout.on('data', function(data) {
		console.log('stdout: ' + data);
	});
	child.stderr.on('data', function(data) {
		console.log('stdout: ' + data);
	});
	child.on('close', function(code) {
		console.log('closing code: ' + code);
	});

Now, it is much better because we get instant updates on what is going on. The output is:

	stdout: Server running at http://127.0.0.1:1337/
	stdout: Visits: 1
	stdout: Visits: 2
	stdout: Visits: 3
	stdout: Visits: 4
	stdout: Visits: 5
	closing code: 0

There is an alternative of <i>exec</i> called <i>spawn</i>. Unlike <i>exec</i> it launches a new process and should be used if we expect long-time communication with the running command. The [API](http://nodejs.org/api/child_process.html) is a little bit different, but both methods work similar.

	child_process.exec(command, [options], callback)
	child_process.spawn(command, [args], [options])

<i>spawn</i> doesn't accept a callback and if we need to pass arguments along with the command name we have to do this in an additional <i>[args]</i> array.

## Killing/Stopping the command

Okey, I didn't say anything new. There are tons of article about how to run a shell command from a Node.js script. However, there are just few resources explaining how to stop the running process. In the beginning I used [child.kill](http://nodejs.org/api/child_process.html#child_process_child_kill_signal) and it worked with the simple scripts which I tested. The problem occurred when I launched <i>grunt</i> command. The Chrome extension nicely showed the results of the tasks but at some point I wanted to restart the process. And it looks like (even after the usage of <i>child.kill</i>) I didn't get the <i>close</i> event firing. So I investigated a bit and saw that the child fired the [<i>exit</i>](http://nodejs.org/api/child_process.html#child_process_event_exit) event, which for me means that the job is somehow 50% done. What was happening was that Grunt launches a bunch of other processes that were still active. In such situations, I normally start searching for a ready-to-use solution, and I found one. It was in the [forever-monitor module](https://github.com/nodejitsu/forever-monitor/):

	var psTree = require('ps-tree');

	var kill = function (pid, signal, callback) {
		signal   = signal || 'SIGKILL';
		callback = callback || function () {};
		var killTree = true;
		if(killTree) {
			psTree(pid, function (err, children) {
				[pid].concat(
					children.map(function (p) {
						return p.PID;
					})
				).forEach(function (tpid) {
					try { process.kill(tpid, signal) }
					catch (ex) { }
				});
				callback();
			});
		} else {
			try { process.kill(pid, signal) }
			catch (ex) { }
			callback();
		}
	};

	// ... somewhere in the code of Yez!
	kill(child.pid);

We are using the PID of the created <i>child</i> to find out its sub processes (via the <i>ps-tree</i> dependency). So far so good. Everything works, but ... guess what ... only under Linux. Once I tried the solution on my Windows7 I got no results. The tasks that I run were active no matter what. 

And as it normally happens, few hours later I found a workaround. It's dummy, but it works. There is a Windows command line instrument called <i>taskkill</i>. So, what I have to do is to detect that my Node.js module is operating on a Windows machine and send the PID to that small utility.

	var isWin = /^win/.test(process.platform);
	if(!isWin) {
		kill(processing.pid);
	} else {
		cp.exec('taskkill /PID ' + processing.pid + ' /T /F', function (error, stdout, stderr) {
		    // console.log('stdout: ' + stdout);
		    // console.log('stderr: ' + stderr);
		    // if(error !== null) {
		    //   	console.log('exec error: ' + error);
		    // }
		});				
	}

The <i>/T</i> (terminates all the sub processes) and <i>/F</i> (forcefully terminating) arguments are also critical and without them we can't achieve the desired results. 

## Summary

I was trying to do the same things like six or seven months back. The <i>spawn</i> process wasn't act as it acts now. Especially under Windows. Now, everything works smooth and as we saw with only one dirty hack we are able to execute shell commands. So, my dream for terminal in the Chrome's DevTools  seems attainable.