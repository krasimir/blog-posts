<?php

    class View {
    
        public static $root = "";
    
        // caching mechanism
        private static $cache;
        public static function add($file, $content) {
            if(self::$cache == NULL) {
                self::$cache = (object) array();
            }
            self::$cache->$file = $content;
        }
        public static function get($file) {
            if(isset(self::$cache->$file)) {
                return self::$cache->$file;
            } else {
                return false;
            }
        }

        // view logic
        public $tplFileContent = NULL;
        public $vars = array();

        public function __construct($path, $data, $root = "") {
            if($root != "") {
                View::$root = $root;
            }
            $cache = View::get($path);
            if(!$cache) {
                $path = View::$root.$path;
                $fh = @fopen($path, "r");
                if(!$fh) {
                    throw new ErrorException("Missing file '".$path."'.");
                }
                $this->tplFileContent = fread($fh, filesize($path));
                fclose($fh);
                View::add($path, $this->tplFileContent);
            } else {
                $this->tplFileContent = $cache;
            }
            $this->vars = $data;
        }
        public function __toString() {
            // adding assigned variabls
            $output = $this->tplFileContent;
            foreach($this->vars as $key => $value) {
                $output = str_replace("{".$key."}", $value, $output);
            }
            return $output;
        }
    }

    function view($path, $data = array(), $root = "") {
        return new View($path, $data, $root);
    }

?>