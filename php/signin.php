<?php	
	header('Access-Control-Allow-Methods: GET, POST');
	$server = "localhost";
	$accname = "hieupham";
	$accpsw = "thunder8551549.";
	$db = "dreamplifyv2";
	$authentication = "zr8rRPVFCVwzhSNW";

	# create connection
	$conn = new mysqli($server, $accname, $accpsw, $db);

	# getting info from input
	$username = $_POST["username"];
	$psw = $_POST["password"];

	# check connection
	if ($conn->connect_error) {
		die("Connection failed: " . $conn->connect_error);
	}
	else {
		echo "Connected successfully\n";
		$select = $conn->query("SELECT * FROM User WHERE username='$username' AND userpsw='$psw'");
		if ($select->num_rows > 0) echo $username;
			/*$html = file_get_html("../intro.html");
			$dom = new DOMDocument;
			$dom->validateOnParse = true;

			//load the html into the object
			libxml_use_internal_errors(true);
			$dom->loadHTML($html);

			$dom->preserveWhiteSpace = false;

			$btSignin = $dom->getElementById("signin");
			echo $html;
			$btSignin->nodeValue = "Hello, ".$username;
			echo "<a href=\"javascript:history.go(-1)\">GO BACK</a>";*/
			//header("Location: {$_SERVER['HTTP_REFERER']}");
			//echo '<script type="text/javascript">successful("$username");</script>';
		else echo "User name does not exist";
			//echo '<script type="text/javascript">unsuccessful();</script>';
	}
	$conn->close();
?>