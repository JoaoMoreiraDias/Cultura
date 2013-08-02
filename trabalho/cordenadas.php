<?php


$url="http://www.era.pt/radar/xml.aspx?tipo=freguesias&hash=";

$chave_localizacao=$_GET["chave"];

$resultado=$url.$chave_localizacao; 

echo file_get_contents($resultado);



?>