<?php

    class CSSSelectors extends Controller {
        public function __construct() {
            die(view("layout.html", array(
                "content" => $this->isLogin() ? view("CSSSelectors.html") : view("loginForm.html")
            )));
        }
    }

?>