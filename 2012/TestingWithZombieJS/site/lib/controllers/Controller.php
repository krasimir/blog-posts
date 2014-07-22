<?php

	class Controller {
		public function __construct() {
			
		}
		public function isLogin() {
            global $credentials;
            if(
                isset($_POST["username"]) && 
                isset($_POST["password"]) && 
                $_POST["username"] == $credentials->username && 
                $_POST["password"] == $credentials->password
            ) {
                $_SESSION["TESTINGWITHZOMBIE"] = "logged";
            }
			return isset($_SESSION["TESTINGWITHZOMBIE"]) && $_SESSION["TESTINGWITHZOMBIE"] != "";
		}
	}

?>