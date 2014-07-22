<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>CSS: :before and :after pseudo elements in practice</title>
        <link rel="stylesheet" href="styles.css" type="text/css">
        <style type="text/css">
            a {
                text-decoration: none;
                font-weight: bold;
                color: #000;
            }
        </style>
	</head>
    <body>
        <p>
        <?php
            $links = array('Home', 'Team', 'Developers');
            $str = '» ';
            for($i=0; $i<count($links); $i++) {
                $str .= '<a href="#">'.$links[$i].'</a>';
                if($i < count($links)-1) {
                    $str .= ' / ';
                }
            }
            echo $str;
        ?>
        </p>
    </body>
</html>