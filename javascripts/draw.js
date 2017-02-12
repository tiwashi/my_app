//Canvasへの描画関連

function set_background_rect(col){
  //引数colは#XXXXXX型のRGBを表すString

  //canvasの実際の大きさをゲットする（そうしないとデフォルト値扱いに）
  var can = document.getElementById("canvas");
  var style = window.getComputedStyle(can, '');

  //pxを削除
  var w = parseInt(style.width.replace(/px/, ""));
  var h = parseInt(style.height.replace(/px/, ""));

  var shape = new createjs.Shape();

  shape.graphics.beginFill(col).drawRect(0, 0, w, h);
  can_stage.addChildAt(shape, 0);

  can_stage.update();
}

function mode_onclick(n){

if (mode != n){
  //フラグの精算等の後処理

  switch (mode) {
    case 0:
      break;
    case 1:
      break;
    case 2:
    //直前のものを消す
    //shape_moveという名前のchildがあるかチェック
    //console.log(can_stage.getChildByName("line_move"));
    var child = can_stage.getChildByName("shape_move");
    if (child != null){
      //消す
      console.log("a");
      can_stage.removeChildAt(can_stage.getChildIndex(child));
      can_stage.update();
    }
      break;
    case 3:
      break;
    case 4:
      break;
    case 5:
      break;
    case 6:
      break;
    case 7:
      break;
    default:
      mode = 0;
      break;
  }
}

  mode = n;

  //サブメニューの表示とか
  //一度サブメニューを消す
  $(".sub_menu").css("display", "none");

    switch (mode) {
      case 0:
        break;
      case 1:
        $("#sm_line").css("display", "block");
        break;
      case 2:
        $("#sm_shape").css("display", "block");
        break;
      case 3:
        break;
      case 4:
        break;
      case 5:
        $("#sm_background").css("display", "block");
        break;
      case 6:
        $("#sm_text").css("display", "block");
        break;
      case 7:
        break;
      default:
        mode = 0;
        break;
    }

}

function clickHandler(event){

  switch (mode) {
    case 0:
    select_graphic(event);
      break;
    case 1:
    draw_line(event);
      break;
    case 2:
    draw_shape(event);
      break;
    case 3:
      break;
    case 4:
      break;
    case 5:
      break;
    case 6:
    draw_text(event);
      break;
    case 7:
      break;
    default:
      mode = 0;
      break;
  }

  //console.log("mode = " + mode);
}

function rolloverHandler(event){
  console.log("mode = " + mode);

  switch (mode) {
    case 0:
      break;
    case 1:
    draw_line_mov(event);
      break;
    case 2:
    draw_shape_mov(event);
      break;
    case 3:
      break;
    case 4:
      break;
    case 5:
      break;
    case 6:
      break;
    case 7:
      break;
    default:
      mode = 0;
      break;
  }

  //console.log("mode = " + mode);
}

function mouseoutHandler(event){
  console.log("mouseout, mode = " + mode);

  switch (mode) {
    case 0:
      break;
    case 1:
      break;
    case 2:
      //line_moveという名前のchildがあるかチェック
      //console.log(can_stage.getChildByName("line_move"));
      var child = can_stage.getChildByName("shape_move");
      if (child != null){
        //消す
        can_stage.removeChildAt(can_stage.getChildIndex(child));
        can_stage.update();
      }
      break;
    case 3:
      break;
    case 4:
      break;
    case 5:
      break;
    case 6:
      break;
    case 7:
      break;
    default:
      mode = 0;
      break;
  }

  //console.log("mode = " + mode);
}

function undo(){
  //処理中だったら抜ける
  var check = false;
  check = check_proceeding();
  if (check){
    return;
  }

  if(can_stage.numChildren > 1){
    redo_list.push(can_stage.getChildAt(can_stage.numChildren - 1));
    console.log(redo_list);
    can_stage.removeChildAt(can_stage.numChildren - 1);
    can_stage.update();
  }
}

function redo(){
  //処理中だったら抜ける
  var check = false;
  check = check_proceeding();
  if (check){
    return;
  }

  if (redo_list.length > 0){
    can_stage.addChild(redo_list.pop());
    can_stage.update();
  }
}

//絵の選択
function select_graphic(event){
  console.log("n = " + String(can_stage.numChildren));
  for (var i = can_stage.numChildren - 1; i > 0; i--){
    gra = can_stage.getChildAt(i);
    if (gra.hitTest(event.localX, event.localY)){
      //絵の範囲内をクリックしてたら透明度チェック
      console.log(i);
      break;
    }else{
      continue;
    }
  }
}

function draw_line(event){
  if (typeof draw_line.flag === 'undefined') {
     draw_line.flag = false;
   }
  if (typeof draw_line.sp === 'undefined'){
    draw_line.sp = new Object();
  }

   if (draw_line.flag){
     //終点の処理
     //まず途中のアレを消す
     var child = can_stage.getChildByName("line_move");
     if (child != null){
       //消す
       can_stage.removeChild(child);
     }

     var g = new createjs.Graphics();

     g.setStrokeStyle($("#line_pixel").val(), "round");
     var ele = document.getElementById("line_color");
     console.log(ele.style.backgroundColor);

     g.beginStroke(ele.style.backgroundColor);
     g.moveTo(draw_line.sp.x, draw_line.sp.y);
     g.lineTo(event.localX, event.localY);
     g.endStroke();

     var shape = new createjs.Shape(g);
     can_stage.addChild(shape);
     end_drawing();
     console.log("num = " + can_stage.numChildren);
     can_stage.update();
   }else{
     //始点の処理
     //console.log("local X = " + event.localX);
     draw_line.sp.x = event.localX;
     draw_line.sp.y = event.localY;
   }

   draw_line.flag = !draw_line.flag;
}

function draw_line_mov(event){
  var mouse = adjustXY(event);

  if (draw_line.flag){
    //line_moveという名前のchildがあるかチェック
    //console.log(can_stage.getChildByName("line_move"));
    var child = can_stage.getChildByName("line_move");
    if (child != null){
      //消す
      console.log("a");
      can_stage.removeChildAt(can_stage.getChildIndex(child));
      can_stage.update();
    }

    var g = new createjs.Graphics();

    g.setStrokeStyle($("#line_pixel").val(), "round");
    var ele = document.getElementById("line_color");
    g.beginStroke(ele.style.backgroundColor);
    g.moveTo(draw_line.sp.x, draw_line.sp.y);
    g.lineTo(mouse.x, mouse.y);
    g.endStroke();

    var shape = new createjs.Shape(g);
    shape.name = "line_move";
    can_stage.addChild(shape);
    //console.log(draw_line.sp.x, draw_line.sp.y, mouse.x, mouse.y);
    can_stage.update();
  }
}

function change_bg(ele){
  //console.log(ele);
  //HSVtoRGB変換する

  can_stage.removeChildAt(0);
  set_background_rect(hsva(ele.hsv[0], ele.hsv[1] / 100, ele.hsv[2] / 100));
}

function hsva(h,s,v){
  var f=h/60,
      i=f^0,
      m=v-v*s,
      k=v*s*(f-i),
      p=v-k,
      q=k+m;

  /*var result = 'rgba('
    +[[v,p,m,m,q,v][i]*255^0,
    [q,v,v,p,m,m][i]*255^0,
    [m,m,q,v,v,p][i]*255^0,a].join(',')+')';*/

  var result = "#";
  result += ([v,p,m,m,q,v][i]*255^0).toString(16) + ([q,v,v,p,m,m][i]*255^0).toString(16) + ([m,m,q,v,v,p][i]*255^0).toString(16);

  console.log(result);
  return result;
}

function end_drawing(){
  //描画が終わった時に呼び出す関数
  redo_list = new Array();
}

function check_proceeding(){
  //いろんな関数のflagから処理中かどうか判定する関数
  //途中だったらtrueを返す
  if (draw_line.flag){
    return true;
  }

  return false;
}

function adjustXY(e) {
  //canvasのマウスイベントを使った時用
  //これでCanvasの左上が0,0の座標に変換される
		var rect = e.target.getBoundingClientRect();
    var mouse = new Object();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top

    return mouse
	}

function python_test(){
  var s = document.createElement("script");
  var a = 3;
  var b = 4;
  var param = "?a=" + a +"&b=" + b;
  s.src = "/~tomo/cgi-bin/test.py" + param;
  document.body.appendChild(s);

}

function callback(json){
  $("#result").html("答えは" + json.answer);
}

//Shape描画
function draw_shape(event){
  //shape_moveという名前のchildがあるかチェック
  //console.log(can_stage.getChildByName("line_move"));
  var child = can_stage.getChildByName("shape_move");
  if (child != null){
    //消す
    console.log("a");
    can_stage.removeChildAt(can_stage.getChildIndex(child));
  }

  //まず各種パラメータをゲット
  var size = $("#shape_pixel").val()
  var shape = $("#shape_select").val()
  var ele = document.getElementById("shape_color");
  var col = ele.style.backgroundColor;

  var s = null;

  console.log(size, shape, col);

  switch (shape){
    case "star":
      s = new createjs.Graphics();
      s.beginFill(col);
      //drawPolyStar(x座標, y座標, 半径, 頂点数, 谷の深さ, 起点角)
      s.drawPolyStar(event.localX, event.localY, size, 5, 0.7, -90);
      break;
  }

  if (s != null){
    can_stage.addChild(new createjs.Shape(s));
    can_stage.update();
  }
}

//Shapeの移動中描画
function draw_shape_mov(event){
  var mouse = adjustXY(event);
  //直前のものを消す
  //shape_moveという名前のchildがあるかチェック
  //console.log(can_stage.getChildByName("line_move"));
  var child = can_stage.getChildByName("shape_move");
  if (child != null){
    //消す
    console.log("a");
    can_stage.removeChildAt(can_stage.getChildIndex(child));
    can_stage.update();
  }

  //まず各種パラメータをゲット
  var size = $("#shape_pixel").val()
  var shape = $("#shape_select").val()
  var ele = document.getElementById("shape_color");
  var col = ele.style.backgroundColor;

  var s = null;

  switch (shape){
    case "star":
      s = new createjs.Graphics();
      s.beginFill(col);
      //drawPolyStar(x座標, y座標, 半径, 頂点数, 谷の深さ, 起点角)
      s.drawPolyStar(mouse.x, mouse.y, size, 5, 0.7, -90);
      break;
  }

  if (s != null){
    can_stage.addChild(new createjs.Shape(s));
    can_stage.getChildAt(can_stage.numChildren - 1).name = "shape_move";
    can_stage.update();
  }
}

//テキスト描画
function draw_text(event){
  //まずフォントサイズと色をゲット
  var size = String($("#text_pixel").val()) + "px " + "Arial"
  var ele = document.getElementById("text_color");
  var col = ele.style.backgroundColor;
  var text = $("#text_text").val()

  if (text != ""){
    console.log(size, col, text);
    var t = new createjs.Text(text, size, col);
    t.x = event.localX;
    t.y = event.localY;
    t.textBaseline = "alphabetic"


    can_stage.addChild(t);
    can_stage.update();
  }


}
