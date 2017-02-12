function set_img_to_egg_first(img, t, date){
  //t...呼び出したエレメント

  /*for (var i = 0; i < paper.project.layers.length; i++){
    for(var j = 0; j < paper.project.layers[i].children.length; j++){
      if (paper.project.layers[i].children[j].name == "img" + t.id + "_" + date){
        return false;
      }
    }
  }*/
  console.log("set_egg_first");
  console.time("put image");
  //画像がすでにあるかチェック
  var items = paper.project.getItems({
    name : "img" + t.id + "_" + date
  });

  if (items.length != 0){
    console.log("already there");
    console.log(img);
    return false;
  }
  var raster = new paper.Raster(img);
  raster.name = "img" + t.id + "_" + date;
  //alert(raster.name);

  //待たせるの解除
  set_waiting_screen(false);

  //トリミング
  raster = trimming(raster);

  raster.scale(150 / raster.width);

  //Canvasの位置
  var margin_x = parseInt($('body').css('margin-left'));
  var margin_y = parseInt($('body').css('margin-top'));

  //console.log(t.style.left, t.style.top, raster.width);

  var id = '#' + t.id

  raster.position = new paper.Point(parseInt(t.style.left, 10) - margin_x + parseInt($(id).width()) / 2, parseInt(t.style.top, 10) - margin_y + parseInt($(id).height()) +5 + raster.height * raster.scaling.y / 2);
  console.log(raster.position);
  //alert($(id).width());
  //alert(raster.position);
  //raster.position = new paper.Point(parseInt(t.style.left, 10) + raster.width * raster.scaling.x / 2, parseInt(t.style.top, 10) + parseInt(t.style.fontSize) + raster.height * raster.scaling.y / 2 + 5);

  /*raster.onClick = function(e){
    if (e.event.button == 2){
      show_choice(e);
    }
    console.log(e);
    //show_eggs(e);
  }*/

  //グラフの種類を999(=未加工)に変更
  var idx = t.id.replace(/[^0-9^\.]/g,"");
  parseInt(idx, 10);
  console.log(idx);
  temp_graph[idx] = 999;
  console.log(temp_graph);


  console.log(raster.name);
  var group = new paper.Group();
  group.addChild(raster);

  group.on('mousedrag', function(e){
    //console.log(e.delta.x);
    //console.log(this.position.x + e.delta.x);
    this.position.x += e.delta.x;
    this.position.y += e.delta.y;
  });

  group.name = "img" + t.id + "_" + date;

  group.on('click', function(e){
    if (e.event.button == 2){
      console.log(e);
      show_choice(e);
    }
  });
  paper.view.draw();



  console.timeEnd("put image");

  //類義語を取る
  console.log("set_egg_first2");
  var new_div = document.createElement('div');
  new_div.id = 'divcan_' + save_query.toLowerCase();
  $(new_div).addClass("candis_imgdiv");
  $(new_div).appendTo('#candis');

  console.log(t.id);
  var tmp_str = t.id.replace(/[^0-9^\.]/g,"");
  word_bank[parseInt(tmp_str, 10)] = [save_query.toLowerCase()];
  search_syn(save_query, t, parseInt(tmp_str, 10));

  //ベース色を黒にセット
  baseColor[parseInt(tmp_str, 10)] = [0, 0, 0];

}

function show_choice(e){
  //座標ゲット
  console.log(temp_graph);

  //なにも選ばれてなかったり、group以外が選ばれてたら終わり
  if (paper.project.selectedItems.length < 1){
    return false;
  }
  console.log(paper.project.selectedItems);
  if (paper.project.selectedItems[0].parent.className != 'Group'){
    return false;
  }

  x = (e.event.x + 5) + "px";
  y = (e.event.y - 3)+ "px";
  console.log(String(x) + ", " +String(y));
  //divをクリックした位置に動かす
  //$("#choice").css();
  $("#choice").css('top',  y);
  $("#choice").css('left',  x);
  $("candis").hide("normal");
  $("#n_g_choice").hide("normal");

  $("#choice").show("normal");
}

function show_eggs(){
  //alert("画像の選択画面っぽいものが浮かんで表示される予定");

  //まずdiv内の画像要素を全部消す
  var children = $('#candis .candis_imgdiv');
  /*for (var i = 0; i < children.length; i++){
    $(children[i]).empty();
  }*/

  $("#candis").empty();
  var div = document.createElement("div");
  div.id = 'candis_selbtn';
  $("#candis").append(div);
  //$("#candis").append("<br>");

 //$(new_div).addClass("candis_imgdiv");
  //$("#candis").empty();

  /*
  //座標ゲット
  x = e.point.x + "px";
  y = e.point.y + "px";
  //divをクリックした位置に動かす
  $("#candis").css('top',  x);
  $("#candis").css('left',  y);*/

  //choiceの場所に表示する
  x = $('#choice').css('top');
  y = $('#choice').css('left');
  //divを位置に動かす
  $("#candis").css('top',  x);
  $("#candis").css('left',  y);

  //choiceを消す
  $("#choice").hide("normal");

  //rasterのnameを取得
  if (paper.project.selectedItems.length < 1){
    return false;
  }

  var name = paper.project.selectedItems[0].name;
  //alert(name);

  //名前がちゃんとゲット出来てなかったらやめ
  if(!/^imginput_/.test(name)){
    return false;
  }

  var id = name.match(/^imginput_.*_/);
  id = name.split("_");
  date = Number(id[2]);
  id = Number(id[1]);

  //切り出しミスったらやめ
  if(id.isNan){
    alert("数字に出来ない");
    return false;
  }

  //divとかボタンの設定
  $('#candis #candis_selbtn').empty();
  for (var i = 0; i < word_bank[id].length; i++){
    var new_div = document.createElement('div');
    new_div.id = 'divcan_' + word_bank[id][i];
    $(new_div).css('clear', 'both');
    $(new_div).addClass("candis_imgdiv");
    if (i != 0){
      $(new_div).css('display','none');
    }
    $('#candis').append(new_div);

    //選択用ラベル
    var btn = $("<input></input>", {
      //css: {border: "5px solid gray"},
      attr: {type: "radio", name: "candis_radio", id: "candis_" + String(i + 1)},
      addClass: "candis_radio",
      val: word_bank[id][i],
      on: {
        change: function(event) {
        }
      }
    });
    var lbl = $("<label></label>", {
      attr: {for: "candis_" + String(i + 1)},
      text: word_bank[id][i],
      on:{
        click: function(e){
          // イベント設定
          console.log($(this).attr('for'));
          var tmp = $('input[name=candis_radio]:checked').val();
          $('#' + $(this).attr('for')).prop('checked', true);
          candis_change(tmp, $('input[name=candis_radio]:checked').val());
          console.log($('input[name=candis_radio]:checked').val());
        }
      }
    });
    $('#candis #candis_selbtn').append(btn);
    $('#candis #candis_selbtn').append(lbl);

    if (i == 0){
      btn.prop("checked", true);
    }
  }

  //画像をセットしていく
  for (var j = 0; j < word_bank[id].length; j++){
    var url = "./download/dlinput_" + String(id) + "_";
    var url_end = ".png";

    for(var i = 0; i < 50; i++){
      var img = new Image();
      var wb_j = j;
      img.onload = candis_img_onload(wb_j, img, i);
      img.onerror = function(){
        //なにもしない
        console.log("だめでした、" + this.src);
      }
      //イベントハンドラを設定
      img.addEventListener('click', set_img_to_egg(id, date, img), false);
      img.style.display = "box";
      img.style.boxPack = "center";
      //img.style.marginLeft = "auto";
      //img.style.marginRight = "auto";
      img.src = url + String(i) + "_" + String(j) + url_end;


    }
  }

  //最後に表示
  //$("#candis").css('display': "inline");
  $("#candis").show("normal");

}

//onload用
function candis_img_onload(wb_j, this_img, i){
  return function(){
      //サイズを調整
      //console.log(this_img);
      this_img.width = 100;
      $(this_img).css('margin', '0 auto');

      var flag = false;

      var tmp = $('#candis .candis_imgdiv');
      var children = $(tmp[i]).find('img');

      for (var i1 = 0; i1 < children.length; i1++){
        if (children[i1].src == this_img.src){
          flag == true;
          break;
        }
      }

      if (flag == false){
        //imgをdivに追加
        var tmp = $('#candis .candis_imgdiv');
        //console.log(tmp);
        //console.log(wb_j);
        tmp[wb_j].append(this_img);
      }
  }
}

//数字とグラフの候補を表示する
function make_n_g_can(){
  //選択されているrasterをゲット
  if (paper.project.selectedItems.length < 1){
    console.log("not selected");
    return false;
  }

  var raster = paper.project.selectedItems[0];
  if (raster.className != "Raster"){
    console.log("not raster");
    return false;
  }

  //文章の取得
  var text = get_id_from_name(raster.name);
  if (text == null){
    console.log("no text");
    return false;
  }

  //数字をnum_canという配列に入れる

  get_number(text);

  //num_canに追加
  $(".n_g_choice#num_can").empty();
  for (var i = 0; i < num_can.length; i++){

    var btn = $("<input></input>", {
      //css: {border: "5px solid gray"},
      attr: {type: "radio", name: "num_radio", id: "n_g_num_" + i},
      addClass: "num_radio",
      val: num_can[i],
      on: {
        change: function(event) {
        }
      }
    });
    var lbl = $("<label></label>", {
      attr: {for: "n_g_num_" + i},
      text: num_can[i],
      on:{
        click: function(e){
          // イベント設定
          console.log($(this).attr('for'));
          $('#' + $(this).attr('for')).prop('checked', true);
          graph_can_draw(raster, text);
          console.log($('input[name=num_radio]:checked').val());
        }
      }
    });
    if (i == 0){
      btn.prop("checked", true);
      //btn.checked = true;
    };
    $(".n_g_choice#num_can").append(btn);
    $(".n_g_choice#num_can").append(lbl);
  }

  //カラーピッカーの調節

  $('#n_g_color').off();
  $('#n_g_color_text').off();

  //初期値
  set_first_color(raster.name);
  $('#n_g_color_text').on('focusin', function(e){
    console.log('focus in');
    $('#n_g_colorpicker').show('normal');
  });

  $('#n_g_color_text').on('focusout', function(e){
    console.log('focus out');
    $('#n_g_colorpicker').hide('normal');
    //graph_can_draw(raster, text);
  });

  $('#n_g_color').on('mouseup', '#n_g_colorpicker', {ras: raster, txt: text}, function(e){
    //alert("click " + e.data.ras);
    graph_can_draw(e.data.ras, e.data.txt);

  });

    /*var call_g_c_d = function(ras, text){
      return function(){
        console.log($('#n_g_colorpicker').mouseup);
        alert("mouse up, raster = " + raster.name);
        graph_can_draw(ras, text);
      };
    }*/

  //$('#n_g_colorpicker').click(call_g_c_d(raster, text));


  /*
  jQuery(function(){
    jQuery('#n_g_color').ColorPicker({
      color: '#00ffff',
      onShow: function(colorpicker){
        jQuery(colorpicker).fadeIn(500);
        return false;
      },
      onHide: function(colorpicker){
        jQuery(colorpicker).fadeOut(500);
        return false;
      },
      onSubmit: function(hsb, hex, rgb){
        console.log(raster);
        graph_can_draw(raster, text);
        jQuery('#n_g_color div').css('backgroundColor', '#' + hex);
      }
    });
  });*/

  //以下表示させるアレ

  //x = (e.event.x + 5) + "px";
  //y = (e.event.y - 3)+ "px";
  x = parseInt($("#choice").css('left'), 10) + 10 + "px";
  y = parseInt($("#choice").css('top'), 10) + 10 + "px";
  console.log(String(x) + ", " +String(y));
  //divをクリックした位置に動かす
  //$("#choice").css();
  $("#n_g_choice").css('top',  y);
  $("#n_g_choice").css('left',  x);

  graph_can_draw(raster);

  $("#choice").hide("normal");
  $("#n_g_choice").show("normal");
}

//グラフの優先度判定
function vali_graphs(num){
  var arr = new Array();
  for (var i = 0; i < num - 1; i++){
    arr.push(i);
  }
  arr.push(999);
  return arr;
}

//グラフ候補の描画
function graph_can_draw(raster, text){
  //canvasの消去
  $(".n_g_choice#graph_can").empty();
  var graph_vari = 6; //グラフのバリエーション
  //ここで判定を入れる
  var arr = vali_graphs(graph_vari);
  console.log(paper.projects);
  var p_i = paper.project.index;//プロジェクトの保存

  //0以外のprojectを全消去
  while (paper.projects.length > 1){
    paper.projects[1].remove();
  }

  //rasterをコピーしてからgroupに突っ込む
  console.log(arr);
  for (var i = 0; i < arr.length; i++){
    //canvasおよびpaperを作成
    var can = document.createElement('canvas');
    $(can).css("border", '1px solid black');
    can.style.background = "white";
    can.style.display = "box";
    can.style.boxPack = "center";
    paper.setup(can);

    //rasterを移す
    var new_raster = new paper.Raster();
    new_raster.source = raster.source;
    new_raster.name = raster.name;


    var num = raster.name.match(/[0-9]+/g);
    var idx = parseInt(num[0], 10);

    var base_col = [0, 0, 0];
    if(idx >= 0){
      if (baseColor[idx] != null){
        base_col = baseColor[idx];
      }
    }
    //黒に塗りつぶす

    console.log("idx = " + idx);
    console.log(baseColor);
    console.log(baseColor[idx]);
    var w = raster.width;
    var h = raster.height;
    var imgdata = raster.getImageData(new paper.Rectangle(0, 0, w, h));
    for (var k = 0; k < w; k++){
      for (var l = 0; l < h; l++){
        if (imgdata.data[4 * w * l + 4 * k + 3] > 0){
          imgdata.data[4 * w * l + 4 * k + 0] = base_col[0];
          imgdata.data[4 * w * l + 4 * k + 1] = base_col[1];
          imgdata.data[4 * w * l + 4 * k + 2] = base_col[2];
          //item.setPixel(k, l, col);
        }
      }
    }
    raster.setImageData(imgdata, new paper.Point(0, 0));


    var w = new_raster.width;
    var h = new_raster.height;
    var imgdata = new_raster.getImageData(new paper.Rectangle(0, 0, w, h));
    for (var k = 0; k < w; k++){
      for (var l = 0; l < h; l++){
        if (imgdata.data[4 * w * l + 4 * k + 3] > 0){
          imgdata.data[4 * w * l + 4 * k + 0] = base_col[0];
          imgdata.data[4 * w * l + 4 * k + 1] = base_col[1];
          imgdata.data[4 * w * l + 4 * k + 2] = base_col[2];
          //item.setPixel(k, l, col);
        }
      }
    }
    new_raster.setImageData(imgdata, new paper.Point(0, 0));

    //groupに入れる
    var group = new paper.Group();
    group.addChild(new_raster);

    //大きさを適当に合わせる
    //item.scale(1 / item.scaling.x);
    //アレだったら()内を調節
    if (new_raster.width > new_raster.height){
      new_raster.scale((can.height / 3) / new_raster.height);
    }else{
      new_raster.scale((can.width / 3) / new_raster.width);
    }
    //グラフを作る

    console.log(new_raster);
    switch(arr[i]){
      case 0:
        console.log("line_pic");
        line_pic_perc(new_raster, text);
        can.onclick = function(){
          raster = raster_reset(raster, 0);
          line_pic_perc(raster, text);
          $("#n_g_choice").hide('normal');
          console.log(raster.parent.position);
          raster.parent.position.x -= raster.parent.bounds.width / 2;
          raster.parent.position.y -= raster.parent.bounds.height / 2;
        }
        break;
      case 1:
        fill_pic(new_raster, text);
        console.log("fill pic");
        can.onclick = function(){
          raster = raster_reset(raster, 1);
          fill_pic(raster, text);
          $("#n_g_choice").hide('normal');
          raster.parent.position.x -= raster.parent.bounds.width / 2;
          raster.parent.position.y -= raster.parent.bounds.height / 2;
        }
        break;
      case 2:
        line_pic(new_raster, text);
        console.log("line_pic");
        can.onclick = function(){
          raster = raster_reset(raster, 2);
          line_pic(raster, text);
          $("#n_g_choice").hide('normal');
          raster.parent.position.x -= raster.parent.bounds.width / 2;
          raster.parent.position.y -= raster.parent.bounds.height / 2;
        }
        break;
      case 3:
        fill_pic_hol(new_raster, text);
        console.log("hol");
        console.log(arr[i]);
        can.onclick = function(){
          console.log("hol onclick");
          raster = raster_reset(raster, 3);
          console.log("hol onclick end");
          fill_pic_hol(raster, text);
          $("#n_g_choice").hide('normal');
          raster.parent.position.x -= raster.parent.bounds.width / 2;
          raster.parent.position.y -= raster.parent.bounds.height / 2;
        }
       break;
      case 4:
         line_pic_hol(new_raster, text);
         console.log("line_pic_hol");
         can.onclick = function(){
           raster = raster_reset(raster, 4);
           line_pic_hol(raster, text);
           $("#n_g_choice").hide('normal');
           raster.parent.position.x -= raster.parent.bounds.width / 2;
           raster.parent.position.y -= raster.parent.bounds.height / 2;
         }
         break;

      case 999:
        normal_img(new_raster, text);
        console.log('normal_img');
        console.log(arr[i]);
        can.onclick = function(){
          console.log("normal onclick");
          raster = raster_reset(raster, 999);
          normal_img(raster, text);
          $("#n_g_choice").hide('normal');
          raster.parent.position.x -= raster.parent.bounds.width / 2;
          raster.parent.position.y -= raster.parent.bounds.height / 2;
        }

        break;
      default:
        console.log('なし');
        break;
    }


    //ポジション合わせ
    var w = group.bounds.width;
    var h = group.bounds.height;
    group.position.x = Math.floor(can.width / 2);
    group.position.y = Math.floor(can.height / 2);

    paper.view.draw();

    $(".n_g_choice#graph_can").append(can);

  }
  //Paperjsの対象を戻しとく
  //paper.project = paper.projects[p_i];
  paper.project = paper.projects[0];

  //paper.view.draw();
  console.log(paper.projects);
}

//絵をしかるべき場所に置く
function set_img_to_egg(id, date, img){
  return function(ev){
    //名前……"img" + t.id + "_" + date
    //alert(id, date);

    //変更すべきアイテムを探す
    var items = paper.project.getItems({
      name : "imginput_" + String(id) + "_" + String(date)
    });

    if (items.length == 0){
      console.log("imginput_" + String(id) + "_" + String(date));
      alert("ない");
      return false;
    }

    var item = items[0];

    if (item.className != "Group"){
      alert("Groupじゃない, " + item.className);
      return false;
    }
    item = item.children[0]

    //トリミング
    item = trimming(item);

    //ここから変える処理
    //グラフの種類に応じてもう一度書き換える
    item.scale(1 / item.scaling.x);
    item.image = img;

    item.scale(150 / item.width);

    console.log(temp_graph);
    console.log(id);

    //文章の取得
    var text = get_id_from_name(item.name);
    if (text == null){
      console.log("no text");
      return false;
    }
    switch (temp_graph[id]) {
      case 0:
        raster_reset(item, 0);
        line_pic_perc(item, text);
        break;
      case 1:
        raster_reset(item, 0);
        fill_pic(item, text);
        break;
      case 2:
        raster_reset(item, 0);
        line_pic(item, text);
        break;
      case 3:
        raster_reset(item, 0);
        fill_pic_hol(item);
        break;
      case 4:
        raster_reset(item, 0);
        line_pic_hol(item);
        break;
      case 999:
        raster_reset(item, 0);
        normal_img(item);
          break;
      default:

    }

    /*
    console.log(item.scaling.x);
    item.scale(1 / item.scaling.x);
    item.image = img;

    item.scale(150 / item.width);
*/
    paper.view.draw();

    $("#candis").hide("normal");

  }
}

//onclickからの呼び出し、全て選択を解除する
function deselect_all(){
  $("#choice").hide("normal");
  $("#change_bc").hide("normal")
  $("#candis").hide("normal");
  $("#n_g_choice").hide("normal");
  paper.project.deselectAll();
}

//onclickからの呼び出し、アイテムが存在するかどうか
function item_exists(x, y){
  //hitTestのオプション
  var hitOptions = {
    fill: true,
    stroke: true,
    segments: true,
    tolerance: 50
  };

  var hitresult = paper.project.hitTest(new paper.Point(x, y), hitOptions);
  //alert(hitresult);

  if (hitresult){
    if (hitresult.item.parent.className == 'Group'){
      var chil = hitresult.item.parent.children;
      for (var i = 0; i < chil.length; i++){
        chil[i].selected = true;
        console.log("item exists");
        console.log(chil[0].name);
      }
    }else{
      hitresult.item.selected = true;
      console.log("item exists");
      console.log(hitresult.item.name);
    }


      return true;
  }else{
    console.log("item not exists");
    return false;
  }

}

//選択中のものがあるかどうか
function selected_exists(){
  if (paper.project.selectedItems.length < 1){
    return false;
  }else{
    return true;
  }
}

function make_graph(){
  console.time("make graph");
  $("#choice").hide("normal");
  if (paper.project.selectedItems.length < 1){
    console.log("not selected");
    return false;
  }

  var raster = paper.project.selectedItems[0];
  if (raster.className != "Raster"){
    console.log("not raster");
    return false;
  }

  //rasterを黒で塗りつぶす
  console.log(paper.project.selectedItems);


  //文章の取得
  var text = get_id_from_name(raster.name);
  if (text == null){
    console.log("no text");
    return false;
  }
  console.log(text);

  //グラフ
  //rasterの子要素を全消去
  raster.removeChildren();

  raster.scale(1 / raster.scaling.x);

  raster.scale(150 / raster.width);

  line_pic_perc(raster, text);
  //fill_pic(raster, text);
  //line_pic(raster, text);
  //num_pic(raster, text);

  paper.view.draw();
}

//x out of 10な感じのグラフ
function line_pic_perc(raster, text){
  console.log("row_pic");
  //var num = get_percentage(raster.name, text) / 10;
  var num = get_checked_num()  / 10;
  var col = get_color(text);
  console.log(col);
  var rgb = hex_to_rgb(col);

  console.log(rgb);

  if (num > 10){
    num = 10;
    console.log("数字大きすぎ");
  }

  //まず10個並べる
  //サイズを現在の1/numにする
  //raster.scale(1 / num);
  //サイズは横150に
  //alert(raster.width);
  raster.scale(150 / raster.width)

  for (var i = 1; i < 10; i++){
    var item = raster.clone();
    item.position.x += (i % 5) * item.bounds.width;
    if (i > 4){
      item.position.y += item.bounds.width;
    }
    raster.parent.addChild(item);
  }


  //色を変える
  var int = Math.floor(num);
  var float = num - int;
  //まず整数部の処理
  for (var i = 0; i <= int; i++){
    item == null;
    if (i == 0){
      item = raster;
    }else{
      item = raster.parent.children[i - 1];
    }
    var w = item.width;
    var h = item.height;

    var imgdata = item.getImageData(new paper.Rectangle(0, 0, w, h));
    for (var k = 0; k < w; k++){
      for (var l = 0; l < h; l++){
        if (imgdata.data[4 * w * l + 4 * k + 3] > 0){
          imgdata.data[4 * w * l + 4 * k + 0] = rgb[0];
          imgdata.data[4 * w * l + 4 * k + 1] = rgb[1];
          imgdata.data[4 * w * l + 4 * k + 2] = rgb[2];
          //item.setPixel(k, l, col);
        }
      }
    }
    item.setImageData(imgdata, new paper.Point(0, 0));
  }

  //小数部分
  item = raster.parent.children[i - 1];
  if (item == null){return;}
  var w = item.width;
  var h = item.height;

  var imgdata = item.getImageData(new paper.Rectangle(0, 0, w, h));
  var lim = h * (1- float);
  for (var k = 0; k < w; k++){
    for (var l = h; l > lim; l--){
      if (imgdata.data[4 * w * l + 4 * k + 3] > 0){
        imgdata.data[4 * w * l + 4 * k + 0] = rgb[0];
        imgdata.data[4 * w * l + 4 * k + 1] = rgb[1];
        imgdata.data[4 * w * l + 4 * k + 2] = rgb[2];
        //item.setPixel(k, l, col);
      }
    }
  }
  item.setImageData(imgdata, new paper.Point(0, 0));

return;
}

//大きい3つと小さい一つみたいな感じのグラフ
function line_pic(raster, text){
  console.log("line pic");
  //var num = get_percentage(raster.name, text) / 10.0;
  var num = get_checked_num()  / 10;
  if (num > 10){
    num = 10;
  }

  var col = get_color(text);
  console.log("num = " + String(num));

  //サイズを現在の1/numにする
  if (num > 1){
    raster.scale(1 / num);
    if ((num * 10) % 10 == 0){
      for (var i = 1; i < num ; i++){
        var item = raster.clone();
        item.position.x += i * item.bounds.width;
        raster.addChild(item);
      }
    }else{
      for (var i = 1; i < num - 1 ; i++){
        var item = raster.clone();
        item.position.x += i * item.bounds.width;
        raster.addChild(item);
      }

      var item = cut_img(raster.clone(), ((10 - (num * 10) % 10)) / 10);
      item.position.x += i * item.bounds.width;
      raster.addChild(item);
    }



  }

}

//上を切る
function cut_img(raster, num){
  //num...０〜１
  var rect = new paper.Rectangle(new paper.Point(0, Math.ceil(raster.height * num)), new paper.Point(raster.width - 1, raster.height - 1));
  var imgData = raster.getImageData(rect);

  raster.width = rect.width;
  raster.height = rect.height;
  raster.setImageData(imgData, new paper.Point(0, 0));

  return raster;
}

//大きい3つと小さい一つみたいな感じのグラフ
function line_pic_hol(raster, text){
  console.log("line pic");
  //var num = get_percentage(raster.name, text) / 10.0;
  var num = get_checked_num()  / 10;
  if (num > 10){
    num = 10;
  }

  var col = get_color(text);
  console.log("num = " + String(num));

  //サイズを現在の1/numにする
  if (num > 1){
    raster.scale(1 / num);
    if ((num * 10) % 10 == 0){
      for (var i = 1; i < num ; i++){
        var item = raster.clone();
        item.position.x += i * item.bounds.width;
        raster.addChild(item);
      }
    }else{
      var item = raster.clone();
      for (var i = 0; i < num - 1 ; i++){
        var item = raster.clone();
        item.position.x += i * item.bounds.width;
        raster.addChild(item);
      }
      var width = item.bounds.width;

      var item = cut_img_hol(raster.clone(), ((10 - (num * 10) % 10)) / 10);
      item.position.x += (i - 1) * width + (width + item.bounds.width) / 2;
      raster.addChild(item);
    }



  }

}

//右を切る
function cut_img_hol(raster, num){
  //num...０〜１
  var rect = new paper.Rectangle(new paper.Point(0, 0), new paper.Point(Math.ceil(raster.width * (1 - num)), raster.height - 1));
  var imgData = raster.getImageData(rect);

  raster.width = rect.width;
  raster.height = rect.height;
  raster.setImageData(imgData, new paper.Point(0, 0));

  return raster;
}

function fill_pic(raster, text){

  //まず何％まで取るか取得
  console.time("fill_pic");
  //var p = get_percentage(raster.name, text);
  var p = get_checked_num();

  var col = get_color(text);
  var rgb = hex_to_rgb(col);
  var w = raster.width;
  var h =raster.height;
  if (p > 100){
    p = 100;
  }

  //set_waiting_screen(true);
  //p%埋める
  var imgdata = raster.getImageData(new paper.Rectangle(0, 0, w, h));
  var lim = h * (100 - p) / 100;
  for (var k = 0; k < w; k++){
    for (var l = h; l > lim; l--){
      if (imgdata.data[4 * w * l + 4 * k + 3] > 0){
        imgdata.data[4 * w * l + 4 * k + 0] = rgb[0];
        imgdata.data[4 * w * l + 4 * k + 1] = rgb[1];
        imgdata.data[4 * w * l + 4 * k + 2] = rgb[2];
        //item.setPixel(k, l, col);
      }
    }
  }
  raster.setImageData(imgdata, new paper.Point(0, 0));
  console.timeEnd("fill_pic");
  //set_waiting_screen(false);
}

function fill_pic_hol(raster, text){

  //まず何％まで取るか取得
  console.time("fill_pic_hol");
  console.log("fill_pic_hol");
  //var p = get_percentage(raster.name, text);
  var p = get_checked_num();

  var col = get_color(text);
  var rgb = hex_to_rgb(col);
  var w = raster.width;
  var h =raster.height;
  if (p > 100){
    p = 100;
  }

  //set_waiting_screen(true);
  //p%埋める
  console.log(rgb);
  var imgdata = raster.getImageData(new paper.Rectangle(0, 0, w, h));
  var lim = w * p / 100;
  console.log("width = " + String(w) + ", height = " + String(h) + ", lim = " + String(lim));
  for (var k = 0; k < h; k++){
    for (var l = 0; l < lim; l++){
      if (imgdata.data[4 * k * w + 4 * l + 3] > 0){
        //console.log("(" + String(k) + ", " + String(l) +")");
        imgdata.data[4 * k * w + 4 * l + 0] = rgb[0];
        imgdata.data[4 * k * w + 4 * l + 1] = rgb[1];
        imgdata.data[4 * k * w + 4 * l + 2] = rgb[2];
        //item.setPixel(k, l, col);
      }
    }
  }
  raster.setImageData(imgdata, new paper.Point(0, 0));
  console.timeEnd("fill_pic_hol");
  //set_waiting_screen(false);
}

function num_pic(raster, text){
  //筋を取得
  //var p = get_number(raster.name, text);
  var p = get_checked_num()  ;
  var col = get_color(text);

  var num_pic = new paper.PointText(new paper.Point(raster.position.x, raster.position.y));
  num_pic.fillColor = col;
  num_pic.fontSize = 40;
  num_pic.position.x -= raster.width / 2 + 10;
  num_pic.position.y -= raster.height / 2 + 10;

  num_pic.content = String(p);
  raster.addChild(num_pic);
}

function normal_img(raster){
  //なにもしない
  return raster;
}

//数字を取り出す
//0~100で返す
function get_percentage(name, text){
  var num = /[0-9]+/.exec(text);
  if (num == null){
    num = "35";
  }
  console.log("num: " + num);
  num = parseInt(num);
  return num;
}

//色を返す
function get_color(text){
  //var col = $('#n_g_color div').css('backgroundColor');
  var col = $('#n_g_color_text').val();
  if (col.charAt(0) != '#'){
    //()内を取り出し
    col = /\(.*\)/g.exec(col);
    if (col != null){
      col = col[0].slice(1, -1);
      rgb = col.split(',');
      if (rgb.length == 3){
        var ret = '#'
        for (var i = 0; i < 3; i++){
          var n = parseInt(rgb[i], 10).toString(16);
          if (n.length < 2){
            n = '0' + n;
          }
          ret += n;
        }
        return ret;
      }else{
        return "#33edff";
      }
    }else{
      return "#33edff";
    }
  }else{
    return col;
  }
  return $('#n_g_color div').css('backgroundColor');
  //return "#33edff";
}

//#xxxxxxからrgbの配列に
function hex_to_rgb(col){
  var rgb = [0, 0, 0];
  if (col.length == 7){
    rgb[0] = parseInt(col.slice(1, 3),16);
    rgb[1] = parseInt(col.slice(3, 5),16);
    rgb[2] = parseInt(col.slice(5, 7),16);
  }

  return rgb;
}

//数字を返す
function get_number(text){
  num_can = new Array();
  console.log(text);
  var num = text.match(/[0-9]+(\.[0-9]+)?/g);
  console.log(num);
  if (num == null){
    //num = ["30", "50"];
    num = [];
  }

  var flag = false;
  console.log("num: " + num);
  for (var i = 0; i < num.length; i++){
    flag = false;
    //同じ数字が無いかチェック
    for (var j = 0; j < num_can.length; j++){
      if (Number(num[i]) == num_can[j]){
        flag = true;
      }
    }
    if (flag == false){
      num_can[i] = Number(num[i]);
    }
  }
}

//rasterに付けたnameから文章を取り出す
function get_id_from_name(name){
  console.log(name);
  var id = name.match(/input_[0-9]*/);
  if (id == null){
    return null;
  }

  id = "#" + id;
  return $(id).text();
}

function trimming(raster){
  console.time("trim");

  var w = raster.width;
  var h = raster.height;
  //rasterからImagedataを作成
  var imgdata = raster.getImageData(new paper.Rectangle(0, 0, raster.width, raster.height));

  //上限、下限、左限、右限のインデックス
  var p_arr = [0, h- 1, 0, w - 1];
  var flags = [false, false, false, false]; //見つかったかどうか

  //上限を探す
  for (var i = 0; i < h; i++){
    for (var j = 0; j < w; j++){
      //右から左に走査
      if (imgdata.data[4 * w * i + 4 * j + 3] > 0){
        p_arr[0] = i;
        flags[0] = true;
        break;
      }
    }
    if (flags[0] == true){
      break;
    }
  }

  //下限を探す
  for (var i = h - 1; i >= 0; i--){
    for (var j = w - 1; j >= 0; j--){
      //左から右に走査
      if (imgdata.data[4 * w * i + 4 * j + 3] > 0){
        p_arr[1] = i;
        flags[1] = true;
        break;
      }
    }
    if (flags[1] == true){
      break;
    }
  }

  //左限を探す
  for (var j = 0; j < w; j++){
    for (var i = 0; i < h; i++){
      //上から下へ走査
      if (imgdata.data[4 * w * i + 4 * j + 3] > 0){
        p_arr[2] = j;
        flags[2] = true;
        break;
      }
    }
    if (flags[2] == true){
      break;
    }
  }

  //右限を探す
  for (var j = w - 1; j >= 0; j--){
    for (var i = h - 1; i >= 0; i--){
      //下から上へ走査
      if (imgdata.data[4 * w * i + 4 * j + 3] > 0){
        p_arr[3] = j;
        flags[3] = true;
        break;
      }
    }
    if (flags[3] == true){
      break;
    }
  }

  console.log(p_arr);
  console.log(raster.width);

  //imagedateで処理
  var rect = new paper.Rectangle(p_arr[2], p_arr[0], p_arr[3] - p_arr[2] + 1, p_arr[1] - p_arr[0] + 1);
  raster_n = raster.getSubRaster(rect);
  var rect_n = new paper.Rectangle(0, 0, raster_n.width, raster_n.height);

  raster.width = raster_n.width;
  raster.height = raster_n.height;
  raster.setImageData(raster_n.getImageData(rect_n));
  console.log(raster.width);

  //消す
  raster_n.remove();

  console.timeEnd("trim");
  return raster;
}

function get_checked_num(){
  return parseInt($('input[name="num_radio"]:checked').val(), 10);
}

function set_first_color(name){
  console.log(name);
  var col = '#71d6ec';
  $.farbtastic('#n_g_colorpicker').setColor(col);
  //$('#n_g_color_text').css('backgroundColor', col);
  //$('#n_g_color_text').val(col);

}

function candis_change(old_w, new_w){
  //単語が同じだったら終了
  if (old_w == new_w){
    return false;
  }

  //違ったらold_wのdivをhideしてnew_wのdivをshow
  $('#divcan_' + old_w).hide();
  $('#divcan_' + new_w).show();
}

function raster_reset(raster, graph_i){
  //rasterのparentからraster(=一番最初)を残して削除する
  var group = raster.parent;
  if (group.className != 'Group'){
    return raster;
  }
  console.log(group.name);

  group.removeChildren(1);

  //最後に横の大きさを150に調節

  raster.scale(1 / raster.scaling.x);
  raster.scale(150 / raster.width);

  //ついでに今現在のグラフidを入れる
  var idx = raster.name;
  idx = idx.split("_");
  idx = parseInt(idx[1], 10);
  if (idx == null){
    return raster;
  }
  console.log(idx);
  console.log(graph_i);
  temp_graph[idx] = graph_i;

  return raster;
}

function change_base(){
  //選択されているrasterをゲット
  if (paper.project.selectedItems.length < 1){
    console.log("not selected");
    return false;
  }

  var raster = paper.project.selectedItems[0];
  if (raster.className != "Raster"){
    console.log("not raster");
    return false;
  }

  //カラーピッカー
  var col = '#000000';
  $.farbtastic('#bc_colorpicker').setColor(col);

  $('#bc_color_text').on('focusin', function(e){
    console.log('focus in');
    $('#bc_colorpicker').show('normal');
  });

  $('#bc_color_text').on('focusout', function(e){
    console.log('focus out');
    $('#bc_colorpicker').hide('normal');
    //graph_can_draw(raster, text);
  });

  $('#change_bc').on('mouseup', '#bc_colorpicker', function(e){
    //alert("click " + e.data.ras);
    //色を取得
    var col = $('#bc_color_text').css('backgroundColor');
    //()内を取り出し
    col = /\(.*\)/g.exec(col);
    if (col != null){
      col = col[0].slice(1, -1);
      var rgb = col.split(',');
      for (i = 0; i < 3; i++){
        rgb[i] = parseInt(rgb[i], 10);
      }
    }

    //色を変える
    for (var i = 0; i < paper.project.selectedItems.length; i++){
      var item = paper.project.selectedItems[i];
      if (item.className != "Raster"){
        continue;
      }

      //塗りつぶす
      var w = item.width;
      var h = item.height;
      var imgdata = item.getImageData(new paper.Rectangle(0, 0, w, h));
      for (var k = 0; k < w; k++){
        for (var l = 0; l < h; l++){
          if (imgdata.data[4 * w * l + 4 * k + 3] > 0){
            imgdata.data[4 * w * l + 4 * k + 0] = rgb[0];
            imgdata.data[4 * w * l + 4 * k + 1] = rgb[1];
            imgdata.data[4 * w * l + 4 * k + 2] = rgb[2];
            //item.setPixel(k, l, col);
          }
        }
      }
      item.setImageData(imgdata, new paper.Point(0, 0));
    }

    //インデックスゲット
    var num = paper.project.selectedItems[0].name.match(/[0-9]+/g);
    if (num[0] != null){
      var idx = parseInt(num[0], 10);
      if (idx >= 0){
        baseColor[idx] = rgb;
      }
    }

  });



  //位置調整＆表示
  x = parseInt($("#choice").css('left'), 10) + 10 + "px";
  y = parseInt($("#choice").css('top'), 10) + 10 + "px";
  console.log(String(x) + ", " +String(y));
  //divをクリックした位置に動かす
  //$("#choice").css();
  $("#change_bc").css('top',  y);
  $("#change_bc").css('left',  x);

  $("#choice").hide("normal");
  $("#change_bc").show("normal");
}
