<?php
    
    
    function error(Exception $e) {
    
        // always output to log first
        $output = 'Message:'.$e->getMessage().'\n\r'.' File:'.$e->getFile().' Line:'.$e->getLine().'\n\r'.' Trace: '.$e->getTraceAsString();
        error_log($output);
        
        // display the error
        die('
            <!doctype html>
            <html>
                <head>
                    <title>{message}</title>
                    <style>
                        body, html {
                            margin: 0;
                            padding: 40px;
                            font-family: Verdana, Tahoma;
                            font-size: 12px;
                            color: #7D7D7D;
                            line-height: 24px;
                            background: #FFF;
                        }
                        #wrapper {
                            width: 100%;
                        }
                        h1 {
                            font-family: Tahoma;
                            font-size: 25px;
                            font-weight: bold;
                            color: #000;
                            margin: 0 0 20px 0;
                        }
                        h2 {
                            font-size: 16px;
                            font-weight: bold;
                            color: #000;
                            margin: 0 0 20px 0;
                        }
                        #stacktrace {
                            padding: 0;
                            margin: 0;
                            line-height: 18px;
                            list-style-type: none;
                        }
                        #stacktrace li {
                            margin: 0;
                            padding: 0;
                            font-size: 11px;
                            cursor: default;
                        }
                        #stacktrace li:hover {
                            color: #000;
                        }
                        a {
                            color: #000;
                        }
                    </style>
                </head>
                <body>
                    <div id="wrapper">
                        <h1>'.$e->getMessage().'</h1>
                        <h2>'.("File: ".$e->getFile()." Line: ".$e->getLine()).'</h2>
                        <ul id="stacktrace">
                            '.'<li>'.implode(explode("\n", $e->getTraceAsString()), '<li>').'
                        </ul>
                    </div>
                </body>
            </html>
        ');
        
    }
    function shutdown() {
        
    }
    function handleError($errno, $errstr, $errfile, $errline) {
        try {
           error(new ErrorException($errstr, 0, $errno, $errfile, $errline));
        } catch (Exception $ex) {
            // if error logging fails, tray again to log the error during error logging :)
            $output = 'message: '.$ex->getMessage().'\n'.'trace: '.$ex->getTraceAsString().'\n';
            error_log($output);
            exit();
        }
    }
    function handleException(Exception $e) {
        try {
            error($e);
        } catch (Exception $ex) {
            // if error logging fails, tray again to log the error during error logging :)
            $output = 'message: '.$ex->getMessage().'\n'.'trace: '.$ex->getTraceAsString().'\n';
            error_log($output);

            // silently exit
            exit();
        }
    }
    function getFilename($path) {
        $parts = explode("/", $path);
        $parts = explode(".", array_pop($parts));
        return $parts[0];
    }
        
    set_error_handler('handleError');
    set_exception_handler('handleException');
    register_shutdown_function('shutdown'); 
    
    error_reporting(E_ALL);
    
?>