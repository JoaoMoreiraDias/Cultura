<?php


$url="http://www.era.pt/radar/xml.aspx?tipo=imoveis&";

$dd=$_GET["dd"];
$cc=$_GET["cc"];
$ff=$_GET["ff"];

$resultado=$url.'dd='.$dd.'&cc='.$cc.'&ff='.$ff; 

echo file_get_contents($resultado);



?>