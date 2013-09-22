<?php	
	$simmons = "http://legacy.cafebonappetit.com/rss/menu/402";
	$maseeh = "http://legacy.cafebonappetit.com/rss/menu/398";
	$baker = "http://legacy.cafebonappetit.com/rss/menu/399";
	$mccormick = "http://legacy.cafebonappetit.com/rss/menu/400";
	$next = "http://legacy.cafebonappetit.com/rss/menu/401";
	$url = "";
	$hall = $_GET['h'];
	if (strcmp($hall, "simmons") == 0) $url = $simmons;
	if (strcmp($hall, "maseeh") == 0) $url = $maseeh;
	if (strcmp($hall, "baker") == 0) $url = $baker;
	if (strcmp($hall, "mccormick") == 0) $url = $mccormick;
	if (strcmp($hall, "next") == 0) $url = $next;
	if ($url != "") echo file_get_contents($url);
?>
