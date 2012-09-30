<?php

    @session_start();
    
    require_once(dirname(__FILE__)."/lib/fabrico/Fabrico.php");
    require_once(dirname(__FILE__)."/config/credentials.php");

    $fabrico = new Fabrico();
    $fabrico->injector()->inject(array("controllers"), dirname(__FILE__)."/lib");

    View::$root = dirname(__FILE__)."/tpl/";

    $fabrico->router()
        ->register("/logout", "Logout")
        ->register("/css-selectors", "CSSSelectors")
        ->register("/home", "Home")
        ->register("/", "Home")
        ->run();
 
?>