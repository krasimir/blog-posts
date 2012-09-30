<?php

	class Logout extends Controller {

		public function __construct() {
            $_SESSION["TESTINGWITHZOMBIE"] = "";
			header("Location: home");
		}

	}

?>