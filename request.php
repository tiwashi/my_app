<?php

//取得したアカウントキー


  //エンドポイントとパラメーターなどをセット
  //画像検索以外の場合は$serviceOpを変更
  $query = "'";
  $query .= "{$_POST['object']}";
  $query .= " icon png'";
  $query = urlencode($query);
  $rootUri = 'https://datamarket.azure.com/dataset/explore/bing/search';
  $serviceOp = "Image";
  //$endpoint = "$rootUri/$serviceOp?\$format=json&Query=$query&ImageFilters='Style:Graphics+Color:Monochrome'";
  //旧$endpoint = "https://api.datamarket.azure.com/Bing/Search/v1/Image?Query=$query&Adult=%27Strict%27&ImageFilters=%27Style%3AGraphics%2BColor%3AMonochrome%27";
  $endpoint = "https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=$query&count=50&safeSearch=Strict&color=Monochrome&imageType=Clipart";
  //$endpoint = "https://api.datamarket.azure.com/Bing/Search/v1/Image?Query=%27bike%27";
  // Encode the credentials and create the stream context.

$auth = base64_encode("$accountKey:$accountKey");
$data = array(
  'http' => array(
    'request_fulluri' => true,
    // ignore_errors can help debug – remove for production. This option added in PHP 5.2.10
    'ignore_errors' => true,
    //'header' => "Authorization: Basic $auth"
    'header' => "Ocp-Apim-Subscription-Key: $accountKey"),
  "ssl"=>array(
        "verify_peer"=>false,
        "verify_peer_name"=>false),
  );

$context = stream_context_create($data);
$result = file_get_contents($endpoint, false, $context);
echo($result);

 ?>
