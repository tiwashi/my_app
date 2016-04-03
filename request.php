<?php
//取得したアカウントキー
  $accountKey = 'Bod44rXlmwPIHsZKcDkSaclUV7C3sLcHoxk0tmb7jq8';

  //エンドポイントとパラメーターなどをセット
  //画像検索以外の場合は$serviceOpを変更
  $query = "'";
  $query .= "{$_POST['object']}";
  $query .= " png'";
  $query = rawurlencode($query);
  $rootUri = 'https://datamarket.azure.com/dataset/explore/bing/search';
  $serviceOp = "Image";
  //$endpoint = "$rootUri/$serviceOp?\$format=json&Query=$query&ImageFilters='Style:Graphics+Color:Monochrome'";
  $endpoint = "https://api.datamarket.azure.com/Bing/Search/v1/Image?Query=$query&Adult=%27Strict%27&ImageFilters=%27Style%3AGraphics%2BColor%3AMonochrome%27";

  // Encode the credentials and create the stream context.

$auth = base64_encode("$accountKey:$accountKey");
$data = array(
  'http' => array(
    'request_fulluri' => true,
    // ignore_errors can help debug – remove for production. This option added in PHP 5.2.10
    'ignore_errors' => true,
    'header' => "Authorization: Basic $auth")
  );

$context = stream_context_create($data);

// Get the response from Bing.

$response = file_get_contents($endpoint, 0, $context);

// Decode the response.
$jsonObj = json_decode($response);
$resultStr = '';

/*
// Parse each result according to its metadata type.
foreach($jsonObj->d->results as $value) {
  switch ($value->__metadata->type) {
    case 'WebResult':
      $resultStr .= "<a href=\"{$value->Url}\">{$value->Title}</a><p>{$value->Description}</p>";
      break;
    case 'ImageResult':
      $resultStr .= "<h4>{$value->Title} ({$value->Width}x{$value->Height}) " .
      "{$value->FileSize} bytes)</h4>" .
      "<a href=\"{$value->MediaUrl}\">" .
      "<img src=\"{$value->Thumbnail->MediaUrl}\"></a><br />";
      break;
    }
  }

  // Substitute the results placeholder. Ready to go.
  $contents = str_replace('{RESULTS}', $resultStr, $contents);
  */
  echo $jsonObj;
  //echo('<ul ID="resultList">');
 ?>
