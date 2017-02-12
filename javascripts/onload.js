//ページロード時の処理
//ここにグローバル変数をまとめる

//handsontableのもの
var table_data = [
  ["car", 50],
  ["bike", 80]
];

var container = document.getElementById('table');
var hot = new Handsontable(container, {
  data: table_data,
  rowHeaders: true,
  colHeaders: ['Object', '#'],
  colWidths: 80,
  rowHeights: 23
});

var img_url = new Array();

//選択中のs_canとか
var s_can_right_select_num = 0;
var s_can_left_select_num = 0;
var s_can_select_array = new Array();
//小さいCanvasの数
var can_num = 10;

//CreateJSの用意
var left_stages = new Array();
var right_stages = new Array();
var edit_stage = null;
var can_stage = null;
//can_stage[0]は透明な背景

//読み込んだ画像を保存しておく変数
var assets = {};

//dlした画像の枚数を保存しておく関数と、予定の枚数を保存しておく関数
var dl_count = 0;
var exp = 0;

//白黒にしたりSobel計算する時に使うCanvasの配列
//画像として使えるならここからassetsにtoDataURLで書き出す
var proc_can_arr = new Array();

//どこまで読み込みに使ったかを保持しておく配列
var dl_num = new Array();

//作ったグラフィック用のコンテナ
var container_array = new Array();

//redo用リスト
var redo_list = new Array();

//描画モード
var mode = 0;

//コーナーの数閾値
var CORNER_THRESHOLD = 100000;

//グラフの種類
var graph_var = 3;

//グラフの優先度の配列
var graph_arr = new Array();

//グラフ候補のstage
var graph_candi_stage = new Array();

//選ばれたグラフ
var sel_graph = 0;

//createJSのセットとか

function page_onload(){
  /*
  for (var i = 0; i < can_num; i++){
    stages.push(new createjs.Stage(("s_can") + String(i + 1)));
  }*/

  edit_stage = new createjs.Stage("edit_can");
  can_stage = new createjs.Stage("canvas");

  //Canvasの大きさの四角を設置してcan_stage[0]に登録
  set_background_rect("#ffffff");

  //イベントハンドラの設定
  can_stage.addEventListener("click", clickHandler);
  var can = document.getElementById("canvas");
  can.onmousemove = rolloverHandler;
  can_stage.addEventListener("mouseleave", mouseoutHandler, false);

  //値の初期化
  $("#line_pixel").val(1);
  $("#shape_pixel").val(30);
  $("#text_pixel").val(20);

  refresh_slider($("#line_pixel").val(), 1);
  refresh_slider($("#shape_pixel").val(), 2);
  refresh_slider($("#text_pixel").val(), 6);


}

//スライダの設定
$(function() {
  $( "#line_slider" ).slider({
    max: 100,
    min: 1,
    range: "min",
    step: 1,
    slide: function(event, ui){
      refresh_slider(ui.value, 1);
    }
  });
});

$(function() {
  $( "#shape_slider" ).slider({
    max: 200,
    min: 1,
    range: "min",
    step: 1,
    slide: function(event, ui){
      refresh_slider(ui.value, 2);
    }
  });
});

$(function() {
  $( "#text_slider" ).slider({
    max: 200,
    min: 1,
    range: "min",
    step: 1,
    slide: function(event, ui){
      refresh_slider(ui.value, 6);
    }
  });
});

function refresh_slider(val, id){
  //console.log("val = " + val + ", id = " + id);
  //idに合わせてinputを変える
  switch(id){
    case 1:
      $("#line_pixel").val(val) ;
      $("#line_slider").slider({
        value: val
      });
      break;
    case 2:
      $("#shape_pixel").val(val) ;
      $("#shape_slider").slider({
        value: val
      });
      break;
    case 6:
      $("#text_pixel").val(val) ;
      $("#text_slider").slider({
        value: val
      });
      break;
    default:
      break;
  }
}
