var exec = require('child_process').exec;
exec('node -v', function(error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
		console.log('exec error: ' + error);
    }
});