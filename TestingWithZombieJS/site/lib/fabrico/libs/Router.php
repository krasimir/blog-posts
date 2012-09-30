<?php

    class Router {

        private $rules;
        private $slug;
        private $method;
        
        public $matchedRule;
        public $params;
        
        public function __construct() {
            $this->method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : "GET";
            $this->slug = isset($_GET["slug"]) ? "/".$_GET["slug"] : "/";
            $this->params = array();            
            // registering get parameters
            $args = parse_url(isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : "");
            if (isset($args['query'])) {
                parse_str($args['query'], $this->params);
            }
            // registering post parameters
            $args = isset($_POST) ? $_POST : array();
            foreach($args as $key => $value) {
                $this->params[$key] = $value;
            }            
        }
        public function register($pattern, $controller, $method = "ALL") {
            $methods = explode(",", $method);
            foreach($methods as $m) {
                $this->rules []= (object) array(
                    "pattern" => $pattern,
                    "controller" => $controller,
                    "method" => $m
                );
            }
            return $this;
        }
        public function run() {
            $numOfRules = count($this->rules);
            for($i=0; $i<$numOfRules; $i++) {
                $rule = $this->rules[$i];
                $controller = $rule->controller;
                $pattern = $rule->pattern;
                if($rule->method == $this->method || $rule->method == "ALL") {
                    $match = $this->match($pattern, $this->slug, $this->params);
                    if($match) {
                        $this->matchedRule = $rule;
                        if(is_callable($controller)) {
                            $controller($this->params);
                        } else {                            
                            $instance = new $controller($this->params);
                        }
                        return $this;
                    }
                }                
            }
        }
        public function match($pattern, $url, &$params) {
            $matched = false;
            $regex = "";
            $vars = array();
            $patternParts = preg_split("/\//", $pattern);
            $numOfParts = count($patternParts);
            for($i=0; $i<$numOfParts; $i++) {
                $part = $patternParts[$i];
                if(substr($part, 0, 1) == "@") {
                    $vars []= (object) array(
                        "index" => $i,
                        "name" => str_replace("@", "", $part)
                    );
                    $regex  .= "[a-zA-Z0-9-_]+";
                } else {
                    $regex .= $part;
                }
                $regex .= $i < $numOfParts-1 ? "/" : "";
            }
            $pattern = str_replace("/", "\/", $regex);
            $result = preg_match("/".$pattern."/", $url);
            if($result) {
                if(count($vars) > 0) {
                    $urlParts = preg_split("/\//", $url);
                    $numOfParts = count($urlParts);
                    for($i=0; $i<$numOfParts; $i++) {
                        foreach($vars as $variable) {
                            if($variable->index == $i) {
                                $params[$variable->name] = $urlParts[$i];
                            }
                        }
                    }
                }
                $matched = true;
            } else {
                $matched = false;
            }
            return $matched;            
        }
    }
    
?>