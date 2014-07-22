<?php

    $message = '';

    // generating expression
    $expression = (object) array(
        "n1" => rand(0, 9), 
        "n2" => rand(0, 9)
    );
    function generateImage($text, $file) {
        $im = @imagecreate(74, 25) or die("Cannot Initialize new GD image stream");
        $background_color = imagecolorallocate($im, 200, 200, 200);
        $text_color = imagecolorallocate($im, 0, 0, 0);
        imagestring($im, 5, 5, 5,  $text, $text_color);
        imagepng($im, $file);
        imagedestroy($im);
    }
    $captchaImage = 'captcha/captcha'.time().'.png';
    generateImage($expression->n1.' + '.$expression->n2.' =', $captchaImage);

    // masking with alphabets
    $alphabet = array('K', 'g', 'A', 'D', 'R', 'V', 's', 'L', 'Q', 'w');
    $alphabetsForNumbers = array(
        array('K', 'g', 'A', 'D', 'R', 'V', 's', 'L', 'Q', 'w'),
        array('M', 'R', 'o', 'F', 'd', 'X', 'z', 'a', 'K', 'L'),
        array('H', 'Q', 'O', 'T', 'A', 'B', 'C', 'D', 'e', 'F'),
        array('T', 'A', 'p', 'H', 'j', 'k', 'l', 'z', 'x', 'v'),
        array('f', 'b', 'P', 'q', 'w', 'e', 'K', 'N', 'M', 'V'),
        array('i', 'c', 'Z', 'x', 'W', 'E', 'g', 'h', 'n', 'm'),
        array('O', 'd', 'q', 'a', 'Z', 'X', 'C', 'b', 't', 'g'),
        array('p', 'E', 'J', 'k', 'L', 'A', 'S', 'Q', 'W', 'T'),
        array('f', 'W', 'C', 'G', 'j', 'I', 'O', 'P', 'Q', 'D'),
        array('A', 'g', 'n', 'm', 'd', 'w', 'u', 'y', 'x', 'r')
    );
    $usedAlphabet = rand(0, 9);
    $code = $alphabet[$usedAlphabet].
            $alphabetsForNumbers[$usedAlphabet][$expression->n1].
            $alphabetsForNumbers[$usedAlphabet][$expression->n2];

    // process form submitting
    function getIndex($alphabet, $letter) {
        for($i=0; $i<count($alphabet); $i++) {
            $l = $alphabet[$i];
            if($l === $letter) return $i;
        }
    }
    function getExpressionResult($code) {
        global $alphabet, $alphabetsForNumbers;
        $userAlphabetIndex = getIndex($alphabet, substr($code, 0, 1));
        $number1 = (int) getIndex($alphabetsForNumbers[$userAlphabetIndex], substr($code, 1, 1));
        $number2 = (int) getIndex($alphabetsForNumbers[$userAlphabetIndex], substr($code, 2, 1));
        return $number1 + $number2;
    }

    if(isset($_POST["code"])) {
        $sentCode = $_POST["code"];
        $result = (int) $_POST["result"];
        if(getExpressionResult($sentCode) === $result) {
            $message = '<p class="success">Success. ('.$result.')</p>';
        } else {
            $message = '<p class="failure">Failure. ('.$result.')</p>';
        }
    }

?>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>PHP: Simple captcha</title>
        <style type="text/css">
            body, html {
                padding: 10px;
                font-family: Verdana;
                font-size: 14px;
            }
            img {
                float: left;
            }
            input[name="result"] {
                border: solid 1px #999;
                padding: 4px;
                margin: 0 0 0 10px;
                float: left;
            }
            input[type="submit"] {
                border: solid 2px #999;
                border-radius: 4px;
                padding: 4px 10px 4px 10px;
                margin: 0 0 0 10px;
                float: left;
                cursor: pointer;
                background: #D7D7D7;
            }
            input[type="submit"]:hover {
                border: solid 2px #000;
            }
            .result p {
                padding: 20px;
                margin: 0 0 20px 0;
                border: solid 1px #949494;
                border-radius: 10px;
                font-size: 20px;
            }
            .success {
                color: #268F21;
            }
            .failure {
                color: #F00;
            }
        </style>
	</head>
    <body>
        <div class="result">
            <?php echo $message; ?>
        </div>
        <form method="post" action="index.php">
            <input type="hidden" name="code" value="<?php echo $code; ?>" />
            <img src="<?php echo $captchaImage; ?>" />
            <input type="text" name="result" />
            <input type="submit" value="submit" />
        </form>
    </body>
</html>