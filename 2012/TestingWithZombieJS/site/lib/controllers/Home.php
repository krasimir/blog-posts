<?php

	class Home extends Controller {

		public function __construct() {
			die(view("layout.html", array(
				"content" => $this->isLogin() ? view("whatIsZombie.html") : view("loginForm.html")
			)));
		}

	}

?>