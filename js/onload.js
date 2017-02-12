//初期値
//*CanvasはCanvasは画面いっぱいにしておく

//使ったテキストから数字とうにっとを抜き出す→数字を手入力できるものを→「Other」ラジオボタンを作って、それがチェックされてたらインプットが表示されるように
//*どの数字を使うか選択出来るようにする
//*数字とグラフを選ぶ選択ウィンドウを作る
//*テキストなどのオブジェクト全て位置が変えられるように
//長めにクリックしたら（ホールドしてたら）動くように
//グラフを作るところで画像を黒色に戻す＆メインキャンバスに描画する時にグループ内最初の一個以外全部吹っ飛ばして大きさも戻す必要が


//Wordnetをさわりはじめる
//修論を描きながら論文誌に出す ヒューマンインタフェース学会に出すことを目標にする
//インタラクションに出す？　←2月の終わりまでには出す

/**********************************

グラフの種類
0...線上に並べる（x out of 10）
1...下から色で塗る
2...大きい二個とちいさい一つみたいな
3...横から色で塗る
4...大きい二個とちいさい一つ横
999...そのまま

増やしたい時はnormal_imgで検索して出たとこ片っ端に追加すればよろし

/**********************************/

//"/private/var/log/apache2/error_log"
//クリックした位置
var x = 0;
var y = 0;

//inputの数 id設定時にnum_input++なのでそのまま個数になる
var num_input = 0;

//マウスがホバーしてるinputの数 現在未使用
var num_over_input = 0;

//contextmenuが実行された時にその時選択されている文字列を保管しておく変数
var sel_word = "";

//paperjsのproject
var project = null;

//数字とグラフを選ぶ候補
var num_can = new Array();

//モード
var mode = 0;

//clickしたとこがsegmentに近いかどうか
var seg_near = false;
var seg_num = 0; //何番目のセグメントに近いか

//クエリ保存用
var save_query = "";

//関連語とか保存、IDごと
var word_bank = new Array();

//今のfocus
var now_focusing_div = null;

//現在のグラフの種類
var temp_graph = new Array();

//色の保存
var baseColor = new Array();

//debug用
var flag1 = false;
var flag2 = false;
var flag3 = false;
var flag4 = false;
var flag5 = false;

//ウィンドウにイベントハンドラを設置
//window.onclickだったの
$("canvas_main_div").onclick = window_on_click;
window.onresize = function(){
  console.log("resize");
  $('#canvas_main').get(0).width = $(window).width();
  $('#canvas_main').get(0).height = $(window).height();
  console.log(paper.project.activeLayer.children[0]);
  paper.view.draw();
};

function on_load(){
  $('#sm_choice').show();

  //$('#canvas_main').width('100%').height('100%');
  $('#canvas_main').get(0).width = $(window).width();
  $('#canvas_main').get(0).height = $(window).height();
  $('#canvas_main').css("background-color","#FFFFFF");

  //Paperjsの準備
  var canvas = document.getElementById('canvas_main');
  paper.setup(canvas);

  var tool = new paper.Tool();

  /*tool.onKeyDown = function(e){
    if (paper.project.selectedItems.length < 1){
      return false;
    }
    var items = paper.project.selectedItems;

    if (e.key == 'delete' || e.key == 'backspace'){
      for (var i = 0; i < items.length; i++){
        items[i].remove();
      }
    }
  };*/
  console.log(paper);

  //Paperjsの準備終わり

  //colorpickerを作成
  $('#n_g_colorpicker').farbtastic('#n_g_color_text');
  $('#rm_line_colorpicker').farbtastic('#rm_line_color_text');
  $('#rm_shape_cp').farbtastic('#rm_shape_color_text');
  $('#rm_shape_fill_cp').farbtastic('#rm_shape_fill_color_text');
  $('#rm_background_cp').farbtastic(function(color){
    $('#rm_background_text').val(color);
    $('#rm_background_text').css("background-color",color);
    change_background_color();
  });
  $.farbtastic('#rm_background_cp').setColor("#FFFFFF");
  $('#rm_text_cp').farbtastic('#rm_text_text');
  $('#bc_colorpicker').farbtastic('#bc_color_text');
  //スライダーリフレッシュ
  refresh_slider($("#line_pixel").val(), 1);
  refresh_slider($("#shape_pixel").val(), 2);
  refresh_slider($("#text_pixel").val(), 6);

  var el = document.querySelector('#canvas_main');
  //el.addEventListener('click', canvas_on_click, false);
  $('#canvas_main').on('click', canvas_on_click);
  $('#canvas_main').on('mousemove', canvas_on_mousemove);

  //canvasの親要素に対しポジショニングを指定
  parentOfTheCanvas = el.parentNode;
  console.log("parent = " + parentOfTheCanvas.id);
  if (parentOfTheCanvas.style.position==null || parentOfTheCanvas.style.position.toLowerCase()=='static') {
    parentOfTheCanvas.style.position='relative';
    parentOfTheCanvas.style.top='0';
    parentOfTheCanvas.style.left='0';
    }

  //$('.choice_').css("cursor", 'pointer');

}

function canvas_on_click(e){
  now_focusing_div = null;
  if (mode != 0){
    op_draw(e);
    if (mode == 6){
      var rect = e.target.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;

      var is_sel = false;
      if (paper.project.selectedItems.length){
        is_sel = true;
      }
      deselect_all();
      var flag = item_exists(x, y);
      //選択肢が表示されていないか
      if ($("#candis").css('display') != 'none' || $("#n_g_choice").css('display') != 'none' || $("#choice").css('display') != 'none'){
        flag = true;
      }

      if (is_sel){
        flag = true;
      }

      if (!flag){
        make_input(x, y);
        return true;
      }
    }
    return false;
  }
  /*
     * rectでcanvasの絶対座標位置を取得し、
     * クリック座標であるe.clientX,e.clientYからその分を引く
     * ※クリック座標はdocumentからの位置を返すため
     * ※rectはスクロール量によって値が変わるので、onClick()内でつど定義
     */
    var rect = e.target.getBoundingClientRect();
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;

  //以下処理

  //クリックした位置にpaper.jsエレメントがあるか確認

  //選択全部解除
  var is_sel = false;
  if (paper.project.selectedItems.length){
    is_sel = true;
  }
  deselect_all();

  var flag = item_exists(x, y);
  //選択肢が表示されていないか
  if ($("#candis").css('display') != 'none' || $("#n_g_choice").css('display') != 'none' || $("#choice").css('display') != 'none'){
    flag = true;
  }

  if (is_sel){
    flag = true;
  }

  if (!flag){
    //make_input(x, y);
    return true;
  }

  window_on_click(e);
}

//新たなテキストボックス（inpu要素）をクリックした位置に作成する
function make_input(x, y){
  //名前とか
  $('<div>').attr({
    id: 'input_' + String(num_input),
    class: 'input-text',
    contenteditable: "true"
  }).appendTo('#canvas_main_div');

  $('#input_' + String(num_input)).append("Insert text here");

//cssでStyleを調整
  $('#input_' + String(num_input)).css({
    position: 'absolute',
    top: y,
    left: x,

    //border: 'none',
    fontSize : String($('#text_pixel').val()) + 'px',
    color : $('#rm_text_text').val(),
    background: 'transparent'
  });

  //フォーカスした時／してない時に枠とか変える
  //フォーカス外れた時の処理もここに
  $('#input_' + String(num_input))
    .focusin(function(e){
      now_focusing_div = $(this);
      $(this).css({
        outline : 0,

        border: 'dotted',
        borderWidth: "1px",
        borderColor: 'cyan'
      });
    })
    .focusout(function(e){
      $(this).css({
        outline : 0,
        border: 'none'
      });

      //空だったら消す
      if ($(this).text() == ""){
        $(this).remove();
        num_input--;
        console.log("removed");
      }
    })

    $('#input_' + String(num_input)).on('mouseover', function(e){

      //modeが0ならdraggableにする
      if (mode == 0){
        $(this).css({
          outline : 0,

          border: 'solid',
          borderWidth: "1px",
          borderColor: 'cyan'
        });
      }
    });
    $('#input_' + String(num_input)).on('mouseout', function(e){
      //modeが0ならdraggableにする
      if (mode == 0){
        $(this).css({
          outline : 0,
          border: 'none'
        });
      }
    });

    $('#input_' + String(num_input)).on('mousedown', function(e){
      //modeが0ならdraggableにする
      if (mode == 0){
        $(this).draggable("enable");
      }
    });

    $('#input_' + String(num_input)).on('click', function(e){
      now_focusing_div = this;
      $(this).draggable("disable");
    });

  //
  $('#input_' + String(num_input)).draggable({
    containment: $("#canvas_main"),
    distance: 10
  });
  $('#input_' + String(num_input)).draggable("disable");

/*  $('#input_' + String(num_input)).dblclick(function (){
    if ($(this).hasClass('ui-draggable-disabled')){
      $(this).draggable("enable");
      console.log("enable");
      $(this).css({
        outline : 0,

        border: 'solid',
        borderWidth: "2px",
        borderColor: 'cyan'
      });

    }else{
      console.log("disable");
      $(this).draggable("disable");
      $(this).css({
        outline : 0,

        border: 'dotted',
        borderWidth: "1px",
        borderColor: 'cyan'
      });
    }
  });*/

  //contextmenuをクリックした時の挙動を追加
  $('#input_' + String(num_input)).contextMenu('myMenu1',
        {
            bindings: {
                'copy': function(t) {
                alert('Trigger was '+t.id+'\nAction was copy');
            },
                'cut': function(t) {
                alert('Trigger was '+t.id+'\nAction was cut');
            },
                'paste': function(t) {
                alert('Trigger was '+t.id+'\nAction was paste');
            },
                'search': function(t) {
                //alert('Trigger was '+t.id+'\nAction was search\n' + document.getSelection());
                //待たせるの開始
                set_waiting_screen(true);
                contextmenu_search(t);
              }
          }
      });

    //フォーカスする
    $('#input_' + String(num_input)).focus();

  num_input++;
  console.log(num_input);
}

function window_on_click(e){

  if (e.button != 0){
    console.log("?");
    return false;
  }

  //bodyタグのマージン
  //Canvasの位置
  var margin_x = parseInt($('body').css('margin-left'));
  var margin_y = parseInt($('body').css('margin-top'));
  console.log($('body').css('margin-left'));

  //DL中は反応しない
  if ($("#loader-scr").css('display') != 'none'){
    console.log("downloading");
    return false;
  }

  //ファイル選択ボタンをクリックしてたらそれのクリックイベントを発火
  /*
  var ho = jQuery(":hover");

  for (var i = 0; i < ho.length; i++){
    //console.log(ho[i].id);
    console.log(ho[i]);
    if (ho[i].id == ){
      console.log("doesn't hover");
      return false;
    }
  }*/

  //選択肢windowが表示されていない時に反応しない
  if ($("#candis").css('display') == 'none' && $("#n_g_choice").css('display') == 'none'){
    console.log("candis or ngchoice not shown");
    return false;
  }

  //Paperjsのオブジェクト上にあるかどうか
  //hitTestのオプション
  var hitOptions = {
    fill: true,
    stroke: true,
    segments: true,
    tolerance: 50
  };

  var hitresult = paper.project.hitTest(new paper.Point(e.clientX - margin_x, e.clientY - margin_y), hitOptions);

  if (hitresult){
    if (hitresult.item.className == "Raster"){
      console.log("hit not raster");
      return false;
    }
  }

  //choice上？
  //candis上?
    var ho = jQuery(":hover");

    for (var i = 0; i < ho.length; i++){
      //console.log(ho[i].id);
      console.log(ho[i]);
      if (ho[i].id == "candis" || ho[i].id == "choice" || ho[i].id == "n_g_choice"){
        console.log("doesn't hover");
        return false;
      }
    }

  $("#choice").hide("normal");
  $("#candis").hide("normal");
  $("#n_g_choice").hide("normal");
  $("#change_bc").hide("normal")


}

//***********スライダの設定*******************************
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
      change_text_size();
      $("#text_pixel").val(val) ;
      $("#text_slider").slider({
        value: val
      });
      break;
    default:
      break;
  }
}
