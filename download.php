<?php
  $url = "{$_POST['object']}";
	$data = file_get_contents($url);
  $dir = "./download/dl{$_POST['num1']}";
  $dir .= "_{$_POST['num2']}";
  $dir .= "_{$_POST['num3']}.png";

  $path = "./download";
  if(!file_exists($path)){
    if(mkdir($path, 0777)){
      echo (0);
    }
  }

  $val = file_put_contents($dir,$data);
  if ($val){
    echo $dir;
  }else{
    echo (0);
  }
	//echo file_put_contents($dir,$data);
?>
