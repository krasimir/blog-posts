<?php

    class Injector {
    
        private $map;
        private $injected;
        private $reportContent = "";
        private $logs;
        
        public function __construct() {
            $this->injected = (object) array();
            $this->map = (object) array();
            $this->logs = array();
        }   
        public function mapFile($file) {
            $this->map->{basename($file)} = (object) array(
                "path" => $file
            );
        }
        public function inject($files, $path = null) {
            if($path != null) {
                $this->parsePath($path);
            }
            if(!is_array($files)) {
                $files = array($files);
            }            
            $result = array();
            foreach($files as $file) {
                if(strpos($file, ".php") === FALSE) {
                    $filesToInject = array();
                    foreach($this->map as $mappedFile) {
                        $file = str_replace("/", "", $file);
                        $pattern = "/(.*)?\/".$file."\/(.*)\.php/i";
                        if(preg_match($pattern, $mappedFile->path)) {
                            if(strpos($mappedFile->path, "Injector.php") === FALSE) {
                                array_push($filesToInject, $mappedFile->path);
                            }
                        }
                    }
                    if(count($filesToInject) > 0) {
                        $this->inject($filesToInject, $path);
                    }
                } else {
                    $basename = basename($file);
                    if(!isset($this->injected->$basename)) {
                        $this->injected->$basename = str_replace(".php", "", $basename);
                        if(!isset($this->map->$basename) || strpos($this->map->{$basename}->path, $file) === FALSE) {
                            throw new Exception("Injector: missing file '".$file."'.");
                        } else {
                            require($this->map->{$basename}->path);
                        }
                    }
                    $result []= $this->injected->$basename;
                }
            }
            return count($result) == 1 ? $result[0] : $result;
        }
        public function parsePath($paths) {
            if(!is_array($paths)) {
                $paths = array($paths);
            }
            foreach($paths as $path) {
                $files = $this->readDir($path);
                foreach($files as $file) {
                    $this->mapFile($file);
                }
            }
        }
        private function readDir($dir) {
            $files = array();
            if ($handle = @opendir($dir)) {
                while (false !== ($entry = readdir($handle))) {
                    if ($entry != "." && $entry != "..") {
                        if(is_dir($dir."/".$entry)) {
                            $files = array_merge($files, $this->readDir($dir."/".$entry));
                        } else if(is_file($dir."/".$entry)) {
                            if(strpos($entry, ".php") !== FALSE) {
                                $files []= $dir."/".$entry;
                            }
                        }
                    }
                }
                closedir($handle);
            }
            return $files;
        }
    }

?>