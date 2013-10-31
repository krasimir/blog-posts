PHP: please, please, clear my cookies

I'm currently working on a JavaScript application which is using the facebook API. There are some things which I need to pass from one page to the other. So, I decided to use cookies. The storing works like a charm, but the deleting doesn't. I needed one hour to find the exact problem.

Here is how I store my cookies:

	setcookie("app_request_type", $_GET["app_request_type"]);
	setcookie("request_ids", $_GET["request_ids"]);

Later I used the following code to retrieve them 

	function getParams($arr) {
		$result = (object) array();
		if(isset($arr)) {
			foreach ($arr as $key => $value) {
				$result->{$key} = $value;
			}
		}
		return $result;
	}
	$SETTINGS = (object) array(
		"cookies" => getParams($_COOKIE)
	);

Everything was ok till the moment where I needed to delete them. I know that the most secure way is to leave the cookie empty and set it's expire time in the past. So:

	setcookie("app_request_type", "", time()-3600);
	setcookie("request_ids", "", time()-3600);

However this doesn't work. They were still there. So, the problem was that the script which store the cookies was in a different directory and at the end I had different paths. The correct way to handle cookies is to add path. 

	// storing
	setcookie("app_request_type", $_GET["app_request_type"], time() + 60*60*24*30, '/');
	setcookie("request_ids", $_GET["request_ids"], time() + 60*60*24*30, '/');

	// deleting
	setcookie("app_request_type", "", time()-3600, '/');
	setcookie("request_ids", "", time()-3600, '/');

The last parameter */* is actually the path.