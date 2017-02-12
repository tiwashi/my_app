var k;
var block;
var cor = new Array();

function detect_corners(){
  if (!document.getElementById("input").files.length){
    alert("画像を入れてね！");
    exit;
  }

  var can = document.getElementById("moto");
  var ctx = can.getContext("2d");
  ctx.clearRect(0, 0, can.width, can.height);

  can = document.getElementById("ato");
  ctx = can.getContext("2d");
  ctx.clearRect(0, 0, can.width, can.height);

  k = document.getElementById("K").value;
  block = 3;
  var flag = document.getElementById("Block3").checked;
  if (flag){
    block = 3;
  }else{
    block = 5;
  }

  //画像の読み込み
  var src = "./download/";
  src += document.getElementById("input").files[0].name;

  var img = document.createElement("img");
  img.onload = function(){
    main(img);
  }
  img.src = src;
  console.log(src);
}

function main(img){
  var canvas = document.getElementById("moto");
  var ctx = canvas.getContext("2d");

  var w = img.width;
  var h = img.height;

  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0);

  //小さくリサイズ
  canvas = resize_to_proc(canvas, img);
  w = canvas.width;
  h = canvas.height;

  var imgData = ctx.getImageData(0, 0, w, h);

  //まずモノクロに加工
  imgData = to_monochrome(imgData);

  ctx.putImageData(imgData, 0, 0);

  //画像にフィットするようにトリミング
  var arr = trimming(imgData);

  var copy_imgdata = ctx.getImageData(arr[0][0], arr[0][1], arr[1], arr[2]);

  canvas.width = arr[1];
  canvas.height = arr[2];

  w = arr[1];
  h = arr[2];

  ctx.putImageData(copy_imgdata, 0, 0);

  //Harrisオペレータでコーナー検出
  var corners = calc_corner(copy_imgdata);

  canvas = document.getElementById("ato");
  canvas.width = w;
  canvas.height = h;
  ctx = canvas.getContext("2d");

  ctx.putImageData(copy_imgdata, 0, 0);
  copy_imgdata = ctx.getImageData(0, 0, w, h);

  copy_imgdata = nuri(copy_imgdata, corners);
  nuri2(canvas);

  var p = document.getElementById("result");
  for (var i =p .childNodes.length-1; i>=0; i--) {
    p.removeChild(p.childNodes[i]);
  }

  var newtext = document.createTextNode("コーナーの数：" + String(cor.length));
  p.appendChild(newtext);

  cor = new Array();

}

function to_monochrome(imgData){
  var w = imgData.width;
  var h = imgData.height;

  for (var x = 0; x < w * h * 4; x += 4){
    //透明度……0なら透明、255なら不透明　不透明度ですねこれわ……
    //imgDataは左上原点で左から右に走査しているっぽい

    //輝度を使用してモノクロに変換
    var br = Math.round(0.3 * imgData.data[x] + 0.6 * imgData.data[x + 1] + 0.1 * imgData.data[x + 2]);
    br = Math.min(br, 255);

    //白色を背景に置く処理
    br += 255 - imgData.data[x+3];
    br = Math.min(br, 255);

    //コントラスト調整
    if (br > 150){
      br = 255;
    }else{
      br = 0;
    }

    //imgDat.data[x]の値を透明度にしてから全部黒で塗る
    imgData.data[x+3] = 255 - br;
    imgData.data[x]= 0;
    imgData.data[x+1]= 0;
    imgData.data[x+2]= 0;
  }

  return imgData;
}

function trimming(imgData){

  var w = imgData.width;
  var h = imgData.height;

  //上限、下限、左限、右限のインデックス
  var p_arr = [-1, h, -1, w];

  //上限を探す
  for (var i = 0; i < 4 * w * h; i += 4){
    if (imgData.data[i+3] != 0){
      p_arr[0] = Math.floor(i / (4 * w));
      break;
    }
  }

  //下限
  for (var i = 4 * w * h - 4; i >= 0; i -= 4){
    if (imgData.data[i+3] != 0){
      p_arr[1] = Math.floor(i / (4 * w));
      break;
    }
  }

  //左
  for (var i = 0; i < w; i++){
    for (var j = 0; j < h; j++){
      if (imgData.data[4 * (j * w + i) + 3 != 0]){
        p_arr[2] = i;
        break;
      }
    }
  }

  //右
  for (var i = w - 1; i >= 0; i--){
    for (var j = 0; j < h; j++){
      if (imgData.data[4 * (j * w + i) + 3 != 0]){
        p_arr[3] = i;
        break;
      }
    }
  }

  //return [[0, 0], w, h];
  return [[p_arr[2], p_arr[0]], p_arr[3] - p_arr[2] + 1, p_arr[1] - p_arr[0] + 1];
  //return [points[0], new_w, new_h];

  //return [new_w, new_h, new_img_data];
}

function resize_to_proc(can, img){
  var size = 1.0;
  var edge = 500;
  var ctx = can.getContext("2d");

  var w = img.width;
  var h = img.height;

  can.width = edge;
  can.height = edge;

  if (w > h){
    size = edge / w;
  }else {
    size = edge / h;
  }

  ctx.drawImage(img, 0, 0, Math.floor(w * size), Math.floor(h * size));

  return can;
}

function calc_corner(imgData){

  w = imgData.width;
  h = imgData.height;

  //白を加算する
  for (var i = 0; i < 4 * w * h; i += 4){
    var a = imgData.data[i + 3];
    imgData.data[i] += 255 - a;
    imgData.data[i + 1] += 255 - a;
    imgData.data[i + 2] += 255 - a;
    imgData.data[i + 3] = 255;
  }

  // パラメータをObjectで渡す
  // blockSize: 近傍領域の大きさ、計算量の都合で3×3または5×5のみサポート
  // k: Harris検出器のkパラメータ、 0.04~0.15を推奨
  // qualityLevel: 内部の閾値処理で用いる、一定値以下の特徴点は削除される
  var params = { blockSize: block, k: k, qualityLevel: 0.01 };
  // 第一引数には対象のImageDataオブジェクトを渡す
  // 第二引数は現在 CornerDetector.HARRIS のみサポート
  // 第三引数にはパラメータオブジェクトを渡す
  // 戻り値は特徴量が格納された配列、値が0以上の位置が特徴点(コーナー)
  var corners = CornerDetector.detect(imgData, CornerDetector.HARRIS, params);

  var n = 0;

  //コーナーを点で塗っとく
  for (var i = 0; i < corners.length; i++){
    if (corners[i] > 0){
      n++;
    }
  }
  console.log("corners = " + n);
  console.log(corners);

  return corners;

}

function nuri(imgData, corners){
  for (var i = 0; i < imgData.data.length; i += 4){
    if (corners[i / 4] > 0){
      cor.push([(i / 4) % imgData.width, Math.floor((i / 4) / imgData.width)]);
    }
  }

  return imgData;
}

function nuri2(can){
  var ctx = can.getContext("2d");
  for (var i = 0; i < cor.length; i++){
  ctx.beginPath();
  ctx.fillStyle = 'rgb(255, 0, 207)'; // 赤
  ctx.arc(cor[i][0], cor[i][1], 2, 0, Math.PI*2, false);
  ctx.fill();
  }
}
