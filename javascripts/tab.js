function change_tab(num){
  //タブの切替をする

  var tab1 = document.getElementById("tab1");
  var tab2 = document.getElementById("tab2");
  var tab3 = document.getElementById("tab3");

  tab1.style.display = "none";
  tab2.style.display = "none";
  tab3.style.display = "none";

  switch (num) {
    case 1:
      //stageのクリア
      console.log("change tab to 1");
      clear_data();
      tab1.style.display = "block";
      break;
    case 2:
      tab2.style.display = "block";
      break;
    case 3:
    default:
      tab3.style.display = "block";
      //prepare_edit_can();
      prepare_graph_candidates();
      break;

  }
}

//表に入力されたもののチェック
function check_table(){
  //object列が空だったり＃列が空だったらalert
  //一行開いてるのもalert

  //何もなかったら当然alert
  if (table_data.length < 1){
    alert("データがありません！");
    return;
  }

  var flag = -1;
  for (var i = 0; i < table_data.length; i++){
    //object列が空だったらフラグを立ててから＃列があるかどうかチェック
    //あったらalert
    if(!table_data[i][0]){
      if (flag == -1){
        flag = i;
      }
      if(table_data[i][1]){
        hot.selectCell(i, 0);
        alert("空のObjectがあります！！");
        return;
      }
    }else{
      //object列が空じゃなかったら#列が空かチェック、空だったらalert
      if(!table_data[i][1]){
        hot.selectCell(i, 1);
        alert("空の#があります！！");
        return;
      }
    }
    //flagがtrueだったらObjectがあるかどうかチェック
    if(flag >= 0){
      if(table_data[i][0]){
        hot.selectCell(flag, 0);
        alert("空の行があります！！");
        return;
      }
    }

    if(i == table_data.length - 1){
      //ループの最後に
      //flagが-1じゃなかったら整形
      if (flag != -1){
        for(;;){
          if (table_data.length != flag){
            table_data.pop();
          }else {
            break;
          }
        }
      }
    }
  }

    hot.render();
    console.log("flag = " + flag);
    //#に数字が全く入っていない列が無いかチェック
    for(var i = 0; i < table_data.length; i++){
      if (isNaN(parseFloat(table_data[i][1]))){
        hot.selectCell(i, 1);
        alert("数字が入っていません！！");
        return;
      }

      if(i == table_data.length - 1){

        //ここでBINGAPIを叩く
        send_request(table_data);
        change_tab(2);
        //ロード画面の表示
        loadscene_on_off(true);
      }
    }
}

function send_request(data){
  //data……data[n][0]がオブジェクト名
  //xmlを配列に入れておく
  var result_arr = new Array(data.length);
  var xml_arr = new Array();
  var num_of_request = 0;

  for(var i = 0; i < data.length; i++){
    var contents = {
      object : data[i][0]
    };

    //Ajaxでphpを呼び出す
    $.ajax({
      type: 'POST',
      url: './request.php', // 実行するPHPの相対パス
      cache: false,
      data: contents, // PHPに渡すデータ。↑で定義。PHPでは$_POST['sender_name']のように、通常フォーム送信された時と同じように値が取得できる。
      success: function(html) {
        //console.log(html);
        // 特にエラーが無くPHPが実行された後に実行する処理
        // jQueryなどが記述可能
        // 引数の html は予約語（決められた名前）で、実行したPHPのecho命令（複数可）などで出力された内容が格納されている。

        //xmlをパーズして上から９つをCanvasに表示させる
        //その時data.lengthに応じて横幅を決める

        xml_arr.push(html);
        num_of_request += 1;

        if(num_of_request == data.length){
          //xmlのパーズへ
          xml_parse(xml_arr);
        }

      },
      error: function() {
        alert("リクエスト失敗");
        change_tab(1);
        // エラーが返ってきた場合の処理
      }
    });
  }
}

function xml_parse(xml_arr){
  if(!window.DOMParser){
    alert("XMLが扱えません");
    change_tab(1);
  }

  var data_arr = new Array(xml_arr.length);
  var dom_parser = new DOMParser();
  for (var i = 0; i < xml_arr.length; i++){
    var doc = dom_parser.parseFromString(xml_arr[i], "application/xml");
    data_arr[i] = doc;
    var toString = Object.prototype.toString;
  }

  //画像表示へ
  download_img(data_arr);
}

function download_img(data_arr){
  var node = new Array();
  img_url = new Array();

  assets = new Array();
  for (var i = 0; i < table_data.length; i++){
    assets.push(new Array(can_num));
  }

  for (var i = 0; i < data_arr.length; i++){
    var url_arr = new Array();
    node[i] = data_arr[i].documentElement;

    var obj = node[i].getElementsByTagName("entry");
    //console.log(obj.length);

    for (var j = 0; j < obj.length; j++){
      //とりあえずURLは全部読みこんどく
      //console.log(obj[j].childNodes[3].childNodes[0].childNodes[2].childNodes[0].nodeValue);
      url_arr.push(obj[j].childNodes[3].childNodes[0].childNodes[2].childNodes[0].nodeValue);
    }

    img_url.push(url_arr);
  }

  //dlに使った配列のインデックスの最大値をリセット
  dl_num = new Array();

  //DLした合計の枚数とDLする予定の枚数をリセット
  dl_count = 0;
  exp = 0;

  //加工用Canvas配列をリセット
  proc_can_arr = new Array();

  for (var i = 0; i < table_data.length; i++){
    proc_can_arr.push(new Array());
  }

  exp = can_num * data_arr.length;

  for (var i = 0; i < img_url.length; i++){

    //どこまで読み込みに使ったか（使う予定か）
    dl_num[i] = can_num - 1;

    var n = can_num;
    if (img_url[i].length < n){
      n = img_url[i].length;
      dl_num[i] = n - 1;
      //不足した分を読み込むべき画像の数から減らす
      exp -= can_num - n;
      console.log("足りなかった");
    }

    for (var j = 0; j < n; j++){
      ajax_download_php(i, j, i, j);
    }
  }

}

//画像ダウンロード用のphp叩くだけ
function ajax_download_php(i, j, i1, j1){
  //i, j...img_urlという配列から読み込むインデックス
  //i1, j1...ファイルに付ける名前に使う

  flag = false; //画像使え無さすぎflag

  if (j >= img_url[i].length){
    console.log("画像使え無さすぎ");

    //やりたいこと
    //dli_j.pngに真っ白な画像を用意する
    //保存の関係から、ajaxでPython呼び出すのがよさ気
    rescue(i1, j1);

    //assets[i1][j1]にその画像を登録
    //とにかく増やす
    dl_num[i]++
    dl_count++;
    console.log(dl_count + "/" + exp);
    if (dl_count == exp){
      load_comp();
    }
    return;

  }
  var contents = {
    object : img_url[i][j],
    num1 : i1,
    num2 : j1,
  };

  console.log(img_url[i][j]);

  //ajaxからPHPを叩く
  $.ajax({
    type: 'POST',
    url: './download.php', // 実行するPHPの相対パス
    cache: false,
    data: contents, // PHPに渡すデータ。↑で定義。PHPでは$_POST['sender_name']のように、通常フォーム送信された時と同じように値が取得できる。
    success: function(html) {
      //console.log(html);
      // 特にエラーが無くPHPが実行された後に実行する処理
      // jQueryなどが記述可能
      // 引数の html は予約語（決められた名前）で、実行したPHPのecho命令（複数可）などで出力された内容が格納されている。

      if (html){
        //htmlが0で無ければ（＝読み込み成功）

        //assetsに入れる
        var img = new Image();
        var src = "./download/dl" + String(i1) + "_" + String(j1) + ".png";
        assets[i1][j1] = img;

        img.onload = function(){
          console.log(img.src);
          var check = check_img(i1, j1);

          if (check == true){
            dl_count++;
            console.log(dl_count + "/" + exp);
            if (dl_count == exp){
              load_comp();
            }
          }else{
            console.log("i1, j1 = " + i1 + ", " + j1);
            assets[i1][j1] = null;
            ajax_download_php(i, ++dl_num[i], i1, j1);
          }
        }

        img.onerror = function(){
          assets[i1][j1] = null;
          ajax_download_php(i, ++dl_num[i], i1, j1);
        }

        img.src = src;
      }else{
        //読み込みに失敗してたらもう一度
        assets[i1][j1] = null;
        ajax_download_php(i, ++dl_num[i], i1, j1);
      }

    },
    error: function() {
      //これはPHP叩くこと自体に失敗してる場合なので……
      alert("リクエスト失敗");
      change_tab(1);
      // エラーが返ってきた場合の処理
    }
  });
}

//ロード完了時に実行
function load_comp(){
  //fairing_assets();
  console.log(assets);

  //proc_can_arrをモノクロにするのとトリミングするのと
  for (var i = 0; i < proc_can_arr.length; i++){
    for (var j = 0; j < proc_can_arr[i].length; j++){
      var ctx = proc_can_arr[i][j].getContext("2d");

      //まずモノクロに加工
      var imgData = to_monochrome(ctx.getImageData(0, 0, proc_can_arr[i][j].width, proc_can_arr[i][j].height));

      ctx.putImageData(imgData, 0, 0);

      //画像にフィットするようにトリミング
      var arr = trimming(imgData);

      var copy_imgdata = ctx.getImageData(arr[0][0], arr[0][1], arr[1], arr[2]);

      proc_can_arr[i][j].width = arr[1];
      proc_can_arr[i][j].height = arr[2];

      w = arr[1];
      h = arr[2];

      ctx.putImageData(copy_imgdata, 0, 0);
    }
  }

  load_assets();
}

//asssetsにproc_can_arrからtoDataURLで書き出す
function load_assets(){
  //まず何枚あるか計算
  var n = 0;
  var m = 0;

  console.log("entering load_assets");

  console.log(proc_can_arr);

  for (var i = 0; i < proc_can_arr.length; i++){
    n += proc_can_arr[i].length;
  }

  for (var i = 0; i < proc_can_arr.length; i++){
    for (var j = 0; j < proc_can_arr[i].length; j++){
      assets[i][j].onload = function(){
        m++
        console.log("now loading...");
        if (m == n){
          select_image();
        }
      }
      assets[i][j].src = proc_can_arr[i][j].toDataURL();
      //assets[i][j].src = assets[i][j].src;
    }
  }
}

//読み込んだ画像の表示
function select_image(){
  //まずはCanvasを全消ししたり作ったりする
  console.log("entering select_image");
  prepare_s_can();

  //最初に選択しておく
  for(var i = 0; i < table_data.length; i++){
    s_can_select_array[i] = 0;
  }

  s_can_select_right(0);
  s_can_select_left(0);

  for(var i = 0; i < table_data.length; i++){
    draw_thumbnail(right_stages[i], assets[i][0]);
  }

  loadscene_on_off(false);
}

function s_can_select_left(id_num){

  var can = document.getElementsByClassName("s_can_left");
  //まず一度全部リセット
  for (var i = 0; i < can.length; i++){
    can[i].style.borderWidth = "1px";
    can[i].style.borderColor = "#000000";
  }

  //引数で指定されたidのキャンバスを変える
  can[id_num].style.borderWidth = "2px";
  can[id_num].style.borderColor = "#FF0000";

  //グローバル変数を変える
  s_can_left_select_num = id_num;
  s_can_select_array[s_can_right_select_num] = id_num;

  //対応するrightのCanvasにサムネイル描画
  draw_thumbnail(right_stages[s_can_right_select_num], assets[s_can_right_select_num][id_num]);

  //console.log("imgs = " + stages[id_num - 1].children);
}

function s_can_select_right(id_num){
  var can = document.getElementsByClassName("s_can_right");
  //まず一度全部リセット
  for (var i = 0; i < can.length; i++){
    can[i].style.borderWidth = "1px";
    can[i].style.borderColor = "#000000";
  }

  //引数で指定されたidのキャンバスを変える
  can[id_num].style.borderWidth = "2px";
  can[id_num].style.borderColor = "#FF0000";

  s_can_right_select_num = id_num;

  //leftに画像を表示する
  for (var i = 0; i < can_num; i++){
    //表示する画像……assets[id_num][i]
    //最後にs_can_right_select_num(s_can_select_array(id_num))する

    draw_thumbnail(left_stages[i], assets[id_num][i]);
    }

    s_can_select_left(s_can_select_array[id_num]);

    //console.log("stages");
    for (var i = 0; i < left_stages.length; i++){
      //console.log(left_stages[i]);
    }
}

function loadscene_on_off(flag){
  //flag=trueなら表示する
  //falseなら消す

  var lay = document.getElementById("overlay-all");
  var gif = document.getElementById("load-gif");

  if (flag){
    //表示
    lay.style.display = "block";
    gif.style.display = "block";
  }else{
    //消去
    lay.style.display = "none";
    gif.style.display = "none";
  }
}

function prepare_edit_can(){
  //コピー元のstage...stages[s_can_select_num - 1]
  //コピー先のstage...edit_stage
  edit_stage.removeAllChildren();

  var cont = new createjs.Container();

  //edit_stageに今のs_can_select_arrayに対応するassetsの画像をaddChildする
  for (var i = 0; i < table_data.length; i++){
    var bmp = new createjs.Bitmap(assets[i][s_can_select_array[i]]);
    cont.addChild(bmp);
  }

  //edit_stageの大きさ調整等
  var can = document.getElementById("edit_can");
  var style = window.getComputedStyle(can, '');

  //pxを削除
  var w = parseInt(style.width.replace(/px/, ""));
  var h = parseInt(style.height.replace(/px/, ""));

  can.width = w;
  can.height = h;

  //Canvasで割り振られる幅
  var can_div = can.width / cont.numChildren;

  for(var i = 0; i < cont.numChildren; i++){
    var size = 1.0;

    //まず幅をフィットさせる
    size = can_div / cont.children[i].image.width;

    //もし高さがはみ出るようならsizeを変える
    if (cont.children[i].image.height * size > can.height){
      size = can.height / cont.children[i].image.height;
    }

    cont.children[i].scaleX = size;
    cont.children[i].scaleY = size;

    //中心点の調整
    cont.children[i].regX = cont.children[i].image.width / 2;
    cont.children[i].regY = cont.children[i].image.height / 2;

    cont.children[i].x = can_div * (i + 0.5);
    cont.children[i].y = can.height / 2;

    //cont.children[i].compositeOperation = "destination-atop";
  }

  edit_stage.addChild(cont);
  edit_stage.update();

  //色付ける
  edit_can_coloring();

}

function edit_can_coloring(){
  //使うもの……table_data, edit_stage
  //四角をかぶせる
  var loop = edit_stage.children[0].numChildren;

  //-------------------------入れるならここで数字からグラフの種類を判定する処理--------------------//

  for (var i = 0; i < loop; i++){
    //四角形の元の大きさ（＝表示されてる画像の見た目のサイズ）をゲット
    var w = edit_stage.children[0].children[i].image.width * edit_stage.children[0].children[i].scaleX;
    var h = edit_stage.children[0].children[i].image.height * edit_stage.children[0].children[i].scaleY;

    //この大きさの四角を作る
    var rect = new createjs.Graphics();

    //色設定
    var col = new Array();
    for (var j = 0; j < 3; j++){
      col.push(parseInt(Math.random() * 255));
    }
    rect.beginFill(createjs.Graphics.getRGB(col[0],col[1],col[2],1.0));

    //数字を取り出し
    //-------------------------入れるならここで数字からグラフの種類を判定する処理--------------------//
    var perc = parseInt(table_data[i][1]);
    //-------------------------ここまで-------------------//

    h *= perc / 100;

    var x = edit_stage.children[0].children[i].x - edit_stage.children[0].children[i].image.width * edit_stage.children[0].children[i].scaleX / 2;
    var y = edit_stage.children[0].children[i].y + edit_stage.children[0].children[i].image.height * edit_stage.children[0].children[i].scaleY / 2 - h;
    rect.drawRect(x, y, w, h);

    console.log("x = " + x + ", y = " + y + ", w = " + w + ", h = " + h);
    var shape = new createjs.Shape(rect);
    shape.compositeOperation = "source-atop";

    edit_stage.children[0].addChild(shape);
  }

  edit_stage.update();
}

function send_to_canvas(){

  console.log(graph_candi_stage[sel_graph].getChildAt(0));
  console.log(graph_candi_stage);
  var cont_src = graph_candi_stage[sel_graph].getChildAt(0);

  //大きさを調節
  var bounds = cont_src.getBounds().clone();
  var size = 500 / bounds.width;

  cont_src.scaleX *= size;
  cont_src.scaleY *= size;

  container_array.push(cont_src);
  can_stage.addChild(container_array[container_array.length - 1]);
  console.log(cont_src);

  //場所は適当に指定
  can_stage.children[can_stage.numChildren - 1].x = 50 + 50 * (can_stage.numChildren - 1);
  can_stage.children[can_stage.numChildren - 1].y = 50 + 50 * (can_stage.numChildren - 1);

  end_drawing();
  can_stage.update();

  del_modal();

}

function del_modal(){
  //モーダルウィンドウを消す
  var win = document.getElementById("div787");
  win.style.display = "none";
  win = document.getElementById("lean_overlay");
  win.style.display = "none";
  change_tab(1);
}

function clear_data(){
  left_stages = new Array();
  right_stages = new Array();
  s_can_select_array = new Array();
  //stagesを空に
  left_stages = new Array();
  right_stages = new Array();

  edit_stage.removeAllChildren();
}

//divをtable_data.length個作り、それぞれにcan_num個のCanvasを作成する
function prepare_s_can(){
  //stagesを空に
  left_stages = new Array();
  right_stages = new Array();

  //div_rightの子要素を全削除
  var right = document.getElementById("s_can_div_right");

  while (right.firstChild){
    right.removeChild(right.firstChild);
  }

  var left = document.getElementById("s_can_div_left");

  while (left.firstChild){
    left.removeChild(left.firstChild);
  }

  //s_can_div_rightにtable_data.length個のテキストとCanvasを作成
  for(var i = 0; i < table_data.length; i++){
    var text_node = document.createTextNode(table_data[i][0]);
    var p = document.createElement("p");
    p.appendChild(text_node);
    right.appendChild(p);

    var can = document.createElement("canvas");
    can.id = "right_s_can_" + String(i);
    can.style.backgroundColor = "white";
    can.width = right.clientWidth * 0.7;
    can.height = can.width * 5 / 8; //黄金比
    can.style.width = String(can.width) + "px";
    can.style.height = String(can.height) + "px";
    can.style.borderStyle = "solid";
    can.style.borderColor = "#000000";
    can.style.borderWidth = "1px";
    can.classList.add("s_can_right");
    var temp = i;
    function callFunc(t){
      s_can_select_right(t);
    }
    //can.addEventListener( "click" , "s_can_select_right(temp)", false );
    can.onclick = callFunc.bind(null, temp);



    right.appendChild(can);
    right.appendChild(document.createElement("br"));
  }
  //s_can_div_leftにcan_num個Canvasを作成
  for (var i = 0; i < can_num; i++){
    var can = document.createElement("canvas");
    can.id = "left_s_can_" + String(i);
    can.style.backgroundColor = "white";
    can.width = left.clientWidth * 0.4;
    can.height = can.width * 5 / 8; //黄金比
    can.style.width = String(can.width) + "px";
    can.style.height = String(can.height) + "px";
    can.style.borderStyle = "solid";
    can.style.borderColor = "#000000";
    can.style.borderWidth = "1px";
    can.style.margin = "5px";
    can.classList.add("s_can_left");
    var temp = i;
    function callFunc(t){
      s_can_select_left(t);
    }
    //can.addEventListener( "click" , "s_can_select_left(temp)", false );
    can.onclick = callFunc.bind(null, temp);


    left.appendChild(can);
    if (!(i % 2)){
      left.appendChild(document.createTextNode("\n"));
    }
  }

  //stageの設定
  for (var i = 0; i < table_data.length; i++){
    right_stages[i] = new createjs.Stage("right_s_can_" + String(i));
  }

  for (var i = 0; i < can_num; i++){
    left_stages[i] = new createjs.Stage("left_s_can_" + String(i));
  }

  //console.log(left_stages);

  //var div_width = parseInt((div.clientWidth/ table_data.length) - 30);
  //console.log(div.clientWidth);


}

//stageと画像を引数にして実行するとbmpを作成→Stageに追加→Updateする
function draw_thumbnail(stage, img){
  //canvasのサイズ調整等の下準備

  //canvasの実際の大きさをゲットする（そうしないとデフォルト値扱いに）
  var can = stage.canvas;
  var style = window.getComputedStyle(can, '');

  //pxを削除
  var w = parseInt(style.width.replace(/px/, ""));
  var h = parseInt(style.height.replace(/px/, ""));

  can.width = w;
  can.height = h;

  //一度中身をクリア
  stage.removeAllChildren();

  if (img != null){
    var bmp = new createjs.Bitmap(img);

    var size = 1.0;

    //まず幅をフィットさせる
    size = can.width / img.width;

    //もし高さがはみ出るようならsizeを変える
    if (img.height * size > can.height){
      size = can.height / img.height;
    }

    bmp.scaleX = size;
    bmp.scaleY = size;

    //中心点の調整
    bmp.regX = img.width / 2;
    bmp.regY = img.height / 2;

    bmp.x = can.width / 2;
    bmp.y = can.height / 2;

    stage.addChild(bmp);
  }

  stage.update();
  //console.log("updated.");
}

//画像がアイコンっぽいかチェックする
function check_img(i, j){
/*
  //作業用のCanvasを作成
  //こっちにはなにしてもいい
  var new_can = document.createElement("canvas");
  new_can.width = w;
  new_can.height = h;

  var i_d = ctx.getImageData(0, 0, w, h);
  ctx = new_can.getContext("2d");
  ctx.putImageData(i_d, 0, 0);

  //小さくリサイズ
  new_can = resize_to_proc(new_can, img);
  w = new_can.width;
  h = new_can.height;

  var imgData = ctx.getImageData(0, 0, w, h);
  console.log(imgData.data.length);
  console.log(new_can.width);

  //まずモノクロに加工
  imgData = to_monochrome(imgData);

  ctx.putImageData(imgData, 0, 0);

  //画像にフィットするようにトリミング
  var arr = trimming(imgData);

  var copy_imgdata = ctx.getImageData(arr[0][0], arr[0][1], arr[1], arr[2]);

  new_can.width = arr[1];
  new_can.height = arr[2];

  w = arr[1];
  h = arr[2];

  ctx.putImageData(copy_imgdata, 0, 0);*/

  //以下画像チェック
  //proc_can_arrayのものは使わないのでPython側でモノクロにしたりちいｓかうしたりする処理が要る

  flag = false;

  var contents = {
    src: "dl" + i + "_" + j + ".png"
  }
  contents = JSON.stringify(contents);
  console.log(contents);

  //ajaxからPHPを叩く
  $.ajax({
    async: false,
    type: 'POST',
    url: './cgi-bin/check.cgi', // 実行するPHPの相対パス
    contentType:'application/json',
    cache: false,
    data: contents, // PHPに渡すデータ。↑で定義。PHPでは$_POST['sender_name']のように、通常フォーム送信された時と同じように値が取得できる。
    success: function(html) {
      //console.log(html);
      // 特にエラーが無くPHPが実行された後に実行する処理
      // jQueryなどが記述可能
      // 引数の html は予約語（決められた名前）で、実行したPHPのecho命令（複数可）などで出力された内容が格納されている。
      console.log(html);
      if (html){
        //htmlが0で無ければ（＝読み込み成功）
        console.log(html);
        var result = parseInt(html.result);
        console.log(result)
        if (result == 1){
          flag = true;
        }else {
          flag = false;
        }
      }else{
        flag = false;
        console.log("HTMLが空");
      }

    },
    error: function() {
      //これはPHP叩くこと自体に失敗してる場合なので……
      alert("リクエスト失敗");
      flag = false;
      return;
      //change_tab(1);
      // エラーが返ってきた場合の処理
    }
  });

  if (flag){
    var img = assets[i][j];
    console.log(img.src);
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    var w = img.width;
    var h = img.height;

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0);

    proc_can_arr[i].push(canvas);
  }

console.log(flag)
return flag;

}

function prepare_graph_candidates(){
  //使えるもの
  //assets[][s_can_select_array[i]]（画像）

  //まずはグラフをどの順番で並べるか決める
  calc_graph_priority(); //graph_arrに代入している

  //初期化
  graph_candi_stage = new Array();

  //一度canvasを消す
  var div = document.getElementById("graph_div");
  while (div.firstChild != null){
    div.removeChild(div.firstChild);
  }

  //graph_var個のcanvasをgraph_divに追加
  for (var i = 0; i < graph_var; i++){
    var can = document.createElement("canvas");
    //var div = document.getElementById("graph_div");
    div.appendChild(can);

    can.id = "graph_" + String(i);
    can.width = parseInt(div.clientWidth * 0.7);
    console.log(div.clientWidth);
    can.height = can.width * 5 / 8 //黄金比
    can.style.width = String(can.width) + "px";
    can.style.height = String(can.height) + "px";
    can.style.backgroundColor = "white";
    can.style.borderStyle = "solid";
    can.style.borderColor = "#000000";
    can.style.borderWidth = "1px";
    can.classList.add("graph_candi");
    var temp = i;
    function callFunc(t){
      graph_can_select(t);
    }
    //can.addEventListener( "click" , "s_can_select_right(temp)", false );
    can.onclick = callFunc.bind(null, temp);

  }
  //グラフを描画
  for (var i = 0; i < graph_arr.length; i++){
    console.log(graph_arr);
    console.log(graph_arr[i]);
    draw_graphs(i);
  }

  //0番を選択
  graph_can_select(0);

}

//どのグラフを優先して表示するか決める
function calc_graph_priority(){
  graph_arr = new Array();
  for (var i = 0; i < graph_var; i++){
    graph_arr.push(graph_var - i - 1);
  }
  console.log(graph_arr);
}

//グラフ形状選択
function graph_can_select(id_num){
  var can = document.getElementsByClassName("graph_candi");
  //まず一度全部リセット
  for (var i = 0; i < can.length; i++){
    can[i].style.borderWidth = "1px";
    can[i].style.borderColor = "#000000";
  }

  //引数で指定されたidのキャンバスを変える
  can[id_num].style.borderWidth = "2px";
  can[id_num].style.borderColor = "#FF0000";

  //グローバル変数を変える
  sel_graph = id_num;

}

//グラフの描画
function draw_graphs(i){
  //なにはともあれまずはstageを作る
  console.log("draw_graphs " + String(graph_arr[i]));
  var can_id = "graph_" + String(i);
  var stage = new createjs.Stage(can_id);
  graph_candi_stage.push(stage);
  var can = document.getElementById(can_id);

  var cont = new createjs.Container();

  switch (graph_arr[i]){
    case 0:
      //絵の上に色
      make_colour(cont, can);
      break;
    case 1:
      //絵を割合に応じて並べる
      make_row(cont, can);
      break;
    case 2:
      //絵の横に数字
      make_number(cont, can);
      break;
    default:
       break;
  }

  stage.addChild(cont);
  stage.update();
}


//図の上に色が乗ったグラフを作る
function make_colour(cont, can){
  //mask作り方
  //マスクの形にしたいオブジェクトにobject.cache(0, 0, w, h)でマスク作成
  //new createjs.AlphaMaskFilter(object.cacheCanvas)でマスクを作成、マスクを適用したいオブジェクトにdstob.filter = [amf]で設定
  //dstob.cache(0, 0, w, h)で適用

  //canは幅と高さだけ取る用
  var text = new createjs.Text("colour","20px Impact", "#CCC");

  var img = pre_image();
  var can_w = can.width;
  var can_h = can.height;

  //描画
  put_in_line(cont, img, can_w, can_h);

  for (var i = 0; i < img.length; i++){
    var bmp = cont.getChildAt(i).clone();

    var w = bmp.image.width;
    var h = bmp.image.height;
    var x = bmp.x;
    var y = bmp.y;

    var alpha = parseFloat(table_data[i][1]);
    console.log("alpha = " + String(alpha));
    //alphaを０〜１に変換
    //もしも最初から１より小さかったらそのまま
    //100より大きかったら１
    if (alpha < 0){
      alpha = 0;
    }
    if (alpha > 1){
      alpha /= 100;
    }
    if (alpha > 1){
      alpha = 1;
    }

    bmp.cache(0, h - Math.floor(h * alpha), w, Math.floor(h * alpha));

    var r = new createjs.Graphics();
    r.beginFill(def_color(i));
    r.drawRect(0, 0, w, Math.floor(h * alpha));
    var s = new createjs.Shape(r);

    var amf = new createjs.AlphaMaskFilter(bmp.cacheCanvas);
    s.filters = [amf];
    s.cache(0, 0, w, Math.floor(h * alpha));
    s.x = x;
    s.y = y + Math.floor(h * bmp.scaleY) - Math.floor(alpha * h * bmp.scaleY);

    //境界判定のために
    s.setBounds(s.x, s.y, w, Math.floor(h * alpha));

    console.log("bmp = " + String(x) + ", " +String(y));
    console.log("s = " + String(s.x) + ", " +String(s.y));
    s.scaleX = bmp.scaleX;
    s.scaleY = bmp.scaleY;

    cont.addChild(s);
  }

  console.log("contのchildren" + String(cont.numChildren));
}

//図を並べたグラフを作る
function make_row(cont, can){
  var img = pre_image();
  //まず桁数を見る
  //minとmaxが一桁ならおけ
  var len_array = new Array();
  var val_array = new Array();
  for (var i = 0; i < img.length; i++){
    len_array.push(String(parseInt(table_data[i][1])).length);
    val_array.push(parseInt(table_data[i][1]));
  }

  if(Math.max.apply(null, len_array) - Math.min.apply(null, len_array) <= 1){
    //桁が同じくらいのとき
    for (var i = 0; i < img.length; i++){
      val_array[i] /= Math.pow(10, Math.min.apply(null, len_array) - 1);
      val_array[i] = parseInt(val_array[i]);
    }

    //画像の横のサイズを決める
    var sep = Math.max.apply(null, val_array) + 2 //Canvasの横の分割数

    for (var i = 0; i < img.length; i++){
      for (var j = 0; j < val_array[i]; j++){
        var bmp = new createjs.Bitmap(img[i]);

        //横のサイズに合うように倍率決定
        var size = (can.width / sep) / bmp.image.width;
        bmp.scaleX = size;
        bmp.scaleY = size;

        //座標
        bmp.x = (j + 1) * (can.width / sep) * 3 / 2 - bmp.image.width * bmp.scaleX / 2 ;
        //中央に対して対象になるように並べる
        bmp.y = (i + 1) * (can.height / (img.length + 1)) - bmp.image.height * bmp.scaleY / 2;

        console.log("2nd");
        console.log(bmp.x);
        console.log(bmp.y);
        console.log(can.style.width);
        console.log(can.width);
        console.log(can.width / sep);
        console.log();
        cont.addChild(bmp.clone());
      }
    }
  }

  for (var i = 0; i < img.length; i++){

  }
}

//図の横に数字のグラフを作る
function make_number(cont, can){
  var img = pre_image();
  var can_w = can.width;
  var can_h = can.height;
  put_in_line(cont, img, can_w, can_h);

  var font_size = cont.getChildAt(0).image.height * 4 / 7;
  var y = cont.getChildAt(0).y - font_size / 2 * cont.getChildAt(0).scaleY;
  console.log("font size = " + String(font_size) + "px");

  for (var i = 0; i < img.length; i++){
    //少し下にずらす
    var bmp = cont.getChildAt(i);
    if (bmp.y + font_size / 2 + bmp.height < can.height){
        bmp.y += font_size / 2;
    }

    //字を入れる
    var text = new createjs.Text(String(table_data[i][1]), String(font_size) + "px Impact", "#303035");
    text.scaleX = cont.getChildAt(0).scaleX;
    text.scaleY = text.scaleX;
    //text.x = bmp.x - font_size / 2 * text.scaleX;
    //text.y = y;
    text.x = bmp.x - font_size * text.scaleX / 2;
    if (i == 0){
      text.y = bmp.y - font_size * text.scaleY;
    }else{
      text.y = cont.getChildAt(0).y - font_size * cont.getChildAt(img.length).scaleY;
    }


    //位置調整
    //text.x += font_size / 2;
    //bmp.x += font_size / 2;

    console.log("zahyou = " + bmp.x + ", " + bmp.y);

    cont.addChild(text);
  }
}

//汎用並べ関数
function put_in_line(cont, img, can_w, can_h){
  for (var i = 0; i < img.length; i++){
    var img_w = img[i].width;
    var img_h = img[i].height;

    var bmp = new createjs.Bitmap(img[i]);

    //どれくらい縮小すべきか
    var margin = 2 / 3 //余裕
    var size = (can_w / img.length) * margin / img_w;
    if (img_h * size > can_h * margin){
      size = can_h * margin / img_h;
    }

    //実際に配置
    bmp.x = Math.floor(can_w / (img.length + 1) * (i + 1) - size * img_w / 2);
    bmp.y = Math.floor(can_h / 2 - size * img_h / 2);
    bmp.scaleX = size;
    bmp.scaleY = size;

    cont.addChild(bmp);
  }
}


//画像を白黒に加工したり切ったりする
function pre_image(){
  var count = 0;

  //画像を配列に入れる
  var img = new Array();
  for (var i = 0; i < assets.length; i++){
    img.push(assets[i][s_can_select_array[i]]);

  }
  return img;

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

//グラフに使う色を決める
function def_color(i){
  var col = [0, 0, 0]

  col[0] = 37;
  col[1] = 240;
  col[2] = 150;

  //チェック
  for (var i = 0; i < col.length; i++){
    if (col[i] < 0){
      col[i] = 0;
    }
    if (col[i] > 255){
      col[i] = 255;
    }
  }

  return "#" + col[0].toString(16) + col[1].toString(16) + col[2].toString(16);
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
  var params = { blockSize: 3, k: 0.04, qualityLevel: 0.01 };
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

  return n;

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

//「画像使え無さすぎ」の時に白い画像を作って保存
function rescue(i, j){

  var contents = {
    src: "dl" + i + "_" + j + ".png"
  }
  contents = JSON.stringify(contents);
  console.log(contents);

  //ajaxからPHPを叩く
  $.ajax({
    async: false,
    type: 'POST',
    url: './cgi-bin/make_white.cgi', // 実行するPHPの相対パス
    contentType:'application/json',
    cache: false,
    data: contents, // PHPに渡すデータ。↑で定義。PHPでは$_POST['sender_name']のように、通常フォーム送信された時と同じように値が取得できる。
    success: function(html) {
      //console.log(html);
      // 特にエラーが無くPHPが実行された後に実行する処理
      // jQueryなどが記述可能
      // 引数の html は予約語（決められた名前）で、実行したPHPのecho命令（複数可）などで出力された内容が格納されている。
      console.log(html);
      if (html){
        //htmlが0で無ければ（＝読み込み成功）
        var img = new Image()
        img.onload = function(){
          assets[i][j] = img
          return;
        }
        img.src = "dl" + i + "_" + j + ".png"
      }else{
        rescue(i, j);
      }

    },
    error: function() {
      //これはPHP叩くこと自体に失敗してる場合なので……
      alert("make_whiteリクエスト失敗");
      flag = false;
      return;
      //change_tab(1);
      // エラーが返ってきた場合の処理
    }
  });

}
