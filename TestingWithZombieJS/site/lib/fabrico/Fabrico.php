<?php

    class Fabrico {
    
        private $injector;
        
        public $router;
        
        public function __construct() {
        
            $this->injector()->inject(array(
                "libs"
            ), dirname(__FILE__));
            
        }
        public function injector() {
            if(!$this->injector) {
                require_once(dirname(__FILE__)."/libs/Injector.php");
                $this->injector = new Injector();
            }
            return $this->injector;
        }
        public function router() {
            if(!$this->router) {
                $this->router = new Router();
            }
            return $this->router;
        }
        
    }

?>