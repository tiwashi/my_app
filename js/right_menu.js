function mode_onclick(n){
  if (n != mode){
    $('#sm_choice').hide();
    $('#sm_line').hide();
    $('#sm_shape').hide();
    $('#sm_upload').hide();
    $('#sm_background').hide();
    $('#sm_text').hide();

    //inputのdraggableとeditable消す
    var children = $('.input-text');
    for (var i = 0; i < children.length; i++){
      $(children[i]).attr('contenteditable', "false");
      $(children[i]).css("cursor", "default");
    }

    switch (n){
      case 0:
        $('#sm_choice').show();
        mode = 0;
        break;
      case 1:
        $('#sm_line').show();
        break;
      case 2:
        $('#sm_shape').show();
        break;
      case 4:
        $('#sm_upload').show();
        break;
      case 5:
        $('#sm_background').show();
        break;
      case 6:
        $('#sm_text').show();
        //contenteditableを付ける
        var children = $('.input-text');
        for (var i = 0; i < children.length; i++){
          $(children[i]).attr('contenteditable', "true");
          $(children[i]).css("cursor", "text");
        }
      default:
        break;
    }


    mode = n;
  }else{
    $('#sm_line').hide();
    $('#sm_shape').hide();
    $('#sm_upload').hide();
    $('#sm_background').hide();
    $('#sm_text').hide();

    mode = 0;
  }

  if (mode != 0){
    deselect_all()
  }
  console.log(mode);
}

function op_draw(e){
  //モードによってスイッチ
  switch (mode) {
    case 0:
      break;
    case 1:
      draw_line(e, true);
      break;
    case 2:
      draw_shape(e);
    default:
      break;

  }
}

function canvas_on_mousemove(e){
  switch(mode){
    case 0:
      break;
    case 1:
      draw_line(e, false);
      break;
  }
}

function draw_line(e, hashi){
  if (typeof draw_line.flag === 'undefined'){
    draw_line.flag = false;
  }

  if (hashi == true){
    if (draw_line.flag == true){
      //最後
      //直前のものを消す
      paper.project.activeLayer.lastChild.remove();
      //s_pointから現在の位置まで線を引く
      var p = new paper.Path.Line(draw_line.s_point, new paper.Point(e.clientX, e.clientY));
      p.strokeColor = $('#rm_line_color_text').val();
      p.strokeWidth = $('#line_pixel').val();
      p.strokeCap = "round";
      //イベントハンドラ付ける
      p.onClick = function(e){
        if (mode != 0){
          console.log("mode != 0");
          return false;
        }
        deselect_all();
        console.log('click path');
        this.selected = true;
      };

      p.onMouseDown = function(e){
        var th = 8;
        var cp = new paper.Point(e.event.layerX, e.event.layerY);
        for (var i = 0; i < this.segments.length; i++){
          if (is_near(th, cp, this.segments[i].point)){
            seg_near = true;
            seg_num = i;
            break;
          }else{
            seg_near = false;
          }
        }
      };

      p.onMouseDrag = function(e){
        if (this.selected == false){
          return false;
        }
        if (mode != 0){
          return false;
          }
        for (var i = 0; i < this.segments.length; i++){

          if (seg_near){
            this.segments[seg_num].point.x += e.delta.x;
            this.segments[seg_num].point.y += e.delta.y;

            e.event.stopPropagation();
            return true;
          }

        }
        this.position.x += e.delta.x;
        this.position.y += e.delta.y;

        e.event.stopPropagation();
      };

      draw_line.flag = false;
    }else{
      //最初
      draw_line.s_point = new paper.Point(e.clientX, e.clientY);
      var p = new paper.Path.Line(draw_line.s_point, draw_line.s_point);
      p.strokeColor = $('#rm_line_color_text').val();
      p.strokeWidth = $('#line_pixel').val();
      p.strokeCap = "round";
      draw_line.flag = true;
    }
  }else{
    //端っこじゃなかったら
    //書いている途中なら
    if (draw_line.flag == true){
      //直前のものを消す
      paper.project.activeLayer.lastChild.remove();
      //s_pointから現在の位置まで線を引く
      var p = new paper.Path.Line(draw_line.s_point, new paper.Point(e.clientX, e.clientY));
      p.strokeColor = $('#rm_line_color_text').val();
      p.strokeWidth = $('#line_pixel').val();
      p.strokeCap = "round";
    }
  }
  paper.view.draw();
}

function change_background_color(){
  $('#canvas_main').css("background-color",$('#rm_background_text').val());
}

function draw_shape(e){
  var p = null;
  var px = $('#shape_pixel').val();
  var poi = new paper.Point(e.clientX, e.clientY);
  console.log(poi);
  console.log(px);

  switch($('#shape_select').val()){
    case 'circle':
      p = new paper.Path.Circle(poi, px);
      break;
    case 'square':
      p = new paper.Path.Rectangle(poi, new paper.Size(parseInt(px, 10), parseInt(px, 10)));
      break;
    case 'r_rectangle':
      p = new paper.Path.Rectangle(poi, new paper.Size(parseInt(px, 10), parseInt(px, 10)));
      p.strokeJoin = 'round';
      break;
    case 'star':
      p = new paper.Path.Star(poi, 5, Math.round(0.6 * px), px);
      break;
    default:
      p = new paper.Path.Circle(poi, px);
      break;
  }
  if (p != null){
    p.strokeColor = $('#rm_shape_color_text').val();
    p.strokeWidth = 5;
    p.fillColor = $('#rm_shape_fill_color_text').val();
    p.rotate(180);
  }

  console.log(p);
  p.onclick = function(e){
    if (mode == 0){
      deselect_all();
      console.log(this);
      this.selected = true;
    }
  };

  p.onMouseDown = function(e){
    var th = 8;
    var cp = new paper.Point(e.event.layerX, e.event.layerY);
    for (var i = 0; i < this.segments.length; i++){
      if (is_near(th, cp, this.segments[i].point)){
        seg_near = true;
        seg_num = i;
        break;
      }else{
        seg_near = false;
      }
    }
  };

  p.onMouseDrag = function(e){
    /*if (mode == 0 && this.selected == true){
      this.position.x += e.delta.x;
      this.position.y += e.delta.y;
    }*/
    if (this.selected == false){
      return false;
    }
    if (mode != 0){
      return false;
      }
    for (var i = 0; i < this.segments.length; i++){

      if (seg_near){
        //大きさを変える
        if (this.segments.length == 4){
          //縦横比を変える
          this.scale(1 + e.delta.x / 50, 1 + e.delta.y / 50)
        }else{
          this.scale(1 + e.delta.x / 50);
        }

        e.event.stopPropagation();
        return true;
      }

    }
    this.position.x += e.delta.x;
    this.position.y += e.delta.y;

    e.event.stopPropagation();
  };

  for (var i = 0; i < p.segments.length; i++){
    var s = p.segments[i];
  }

  paper.view.draw();
}

function is_near(th, p1, p2){
  //p1とp2の距離がthピクセルよりも小さかったらtrueを返す
  //p1, p2はpaper.Point
  console.log(p1);
  console.log(p2);
  if (Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) <= th * th){
    console.log("near");
    return true;
  }else{
    console.log("not near");
    return false;
  }
}

function  c_up(){
  if (paper.project.selectedItems.length < 1){
    return false;
  }
  var id = paper.project.selectedItems[0].index
  if (id == paper.project.activeLayer.children.length - 1){
    return false;
  }
  //すぐ上と交換
  var item = paper.project.selectedItems[0];
  item.bringToFront();
  //paper.project.activeLayer.children[id].replaceWith(paper.project.activeLayer.children[id + 1]);
  //paper.project.activeLayer.children[id + 1].replaceWith(item);

  paper.view.draw();
}

function c_down(){
  if (paper.project.selectedItems.length < 1){
    return false;
  }
  var id = paper.project.selectedItems[0].index
  if (id == 0){
    return false;
  }
  //すぐ↓と交換
  var item = paper.project.selectedItems[0];
  item.sendToBack();

  paper.view.draw();

}

function delete_sel(){
  //paperオブジェクト消す
  //choiceを消す
  console.log("delete_sel");
  $("#choice").hide("normal");

  if (paper.project.selectedItems.length < 1){
    //div消す
    if (now_focusing_div){
      now_focusing_div.remove();
      now_focusing_div = null;
    }
    //choiceを消す
    $("#choice").hide("normal");
    return false;
  }
  var items = paper.project.selectedItems;
  for (var i = 0; i < items.length; i++){
    items[i].remove();
  }

}

function change_text_size(){
  var sel_text = window.getSelection();
  console.log(sel_text);
  if (sel_text.toString() == ''){
    return false;
  }

  //sel_text.fontSize = String($("#text_pixel").val()) + "px";
}
