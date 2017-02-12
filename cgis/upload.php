<?php
//画像の保存先のパスを指定
//$path = '0';
if($_FILES['file']){
  $timestamp = time();
  $path = '../upload/';
  $path .= strval($timestamp);
  $path .= '.png';
  move_uploaded_file($_FILES['file']['tmp_name'], $path);
}
echo '<script type="text/javascript">
alert("hello");
//console.log(<?php echo $path; ?>);
</script>';
?>
