<?php



$database="positivity";
$host="localhost";
$user="root";
$password="basile3319";

$db = new mysqli($host, $user, $password, $database);

if (mysqli_connect_errno()) {
   printf("DB error: %s", mysqli_connect_error());
   exit();
}

?>
