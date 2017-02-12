//BING API叩くところだけをまとめたファイルです

//画像のDLまでやる

//BING APIの呼び出し
function call_BING_API(query, t, words_i){
  if (words_i > 5){
    return false;
  }

  save_query = query;
  //t...コンテキストメニューを呼び出したエレメント
  var contents = {
    object : query
  };

  console.time("calling bing API");
  console.log("calling BING API...");
  //Ajaxでphpを呼び出す
  $.ajax({
    //async: false,
    type: 'POST',
    url: './request.php', // 実行するPHPの相対パス
    cache: false,
    data: contents, // PHPに渡すデータ。↑で定義。PHPでは$_POST['sender_name']のように、通常フォーム送信された時と同じように値が取得できる。
    success: function(html) {
      //console.log(html);
      // 特にエラーが無くPHPが実行された後に実行する処理
      // jQueryなどが記述可能
      // 引数の html は予約語（決められた名前）で、実行したPHPのecho命令（複数可）などで出力された内容が格納されている。

      //console.log(html);
      var date = new Date();
      console.timeEnd("calling bing API");
      json_parse(html, t, date.getTime(), words_i);

    },
    error: function() {
      console.log("リクエスト失敗 BING API");
      return false;
      // エラーが返ってきた場合の処理
    }
  });
}

//XMLをDOMparserにかける
/*
function xml_parse(xml, t, date){
  console.time("parse XML");
  if(!window.DOMParser){
    alert("XMLが扱えません");
    return false;
  }
  var dom_parser = new DOMParser();
  var doc = dom_parser.parseFromString(xml, "application/xml");

  //URLを取り出す
  get_img_src(doc, t, date);
}
*/

//JSON→オブジェクト
function json_parse(json, t, date, words_i){
  console.log(json);
  var obj = JSON.parse(json);
  console.log(obj);
  get_img_src(obj, t, date, words_i);
}

//URLを取り出す
function get_img_src(obj, t, date, words_i){
  /*
  var node = new Array();
  var url_arr = new Array();

  node = doc.documentElement;

  console.log("doc:");
  console.log(doc);
  var obj = node.getElementsByTagName("entry");
  //console.log(obj.length);


  for (var i = 0; i < obj.length; i++){
    //とりあえずURLは全部読みこんどく
    //console.log(obj[j].childNodes[3].childNodes[0].childNodes[2].childNodes[0].nodeValue);
    //url_arr.push(obj[i].childNodes[3].childNodes[0].childNodes[2].childNodes[0].nodeValue);
    console.log(obj[i].childNodes[4].childNodes[4].nodeValue);
    url_arr.push(obj[i].childNodes[4].childNodes[4].nodeValue);
  }*/
  var url_arr = new Array();

  for (var i = 0; i < obj.value.length; i++){
    //console.log(obj.value[i].contentUrl);
    url_arr.push(obj.value[i].contentUrl);
  }

  //画像のDL
  download_img(url_arr, t, date, words_i);
}

//画像をDLするPHPを叩く
function download_img(url_arr, t, date, words_i){
  console.timeEnd("parse XML");

/*
  var flag = false;

  for (var i = 0; i < url_arr.length; i++){
    var worker = new Worker('js/downloadworker.js');
    var obj = {
      url_arr : url_arr,
      id : t.id,
      date : date,
      i : i
    };
    if (i == 0){console.time("image DL and check");}
    worker.postMessage(obj);

    worker.onmessage = function(e){
      var t = document.getElementById(e.data.id);
      var date = e.data.date;

      var img = new Image();
      img.onload = function(){
        if (flag == false){
          set_img_to_egg_first(img, t, date);
          flag = true;
        }
      }

      img.src = e.data.src;
    }
  }*/


  var total = 0;
  for(var i = 0; i < url_arr.length; i++){
    //console.log("download: " + i);
    var forCount = i;
    (function(i){
      var contents = {
        object : url_arr[i],
        num1 : t.id,
        num2 : i,
        num3 : words_i
      };

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
            total++;
            if (total == 50){
              console.log("dl ended.");
            }
            //console.log("total : " + total);

            //assetsに入れる
            var img = new Image();
            //console.log(html);
            //var src = "./download/dl" + t.id + "_" + String(i) + ".png";

            //返ってきたhtmlが.pngで終わってるかどうか確認
            var src = html.match(/\.png$/);

            if (src != null){

              img.onload = function(){
                if (flag4 == false){
                  console.timeEnd("loading to img");
                  console.time("calling check_img");
                  flag4 = true;
                }

                var check = check_img(html, this, t, date, words_i);


                if (check == true){
                  console.log("id: " + t);
                  set_img_to_egg_first(img, t, date);
                }else{
                  //なにもしない
                }

              }
              img.onerror = function(){
                //なにもしない
              }
              if (flag3 == false){
                console.timeEnd("image DL");
                console.log("html: " + html);
                console.time("loading to img");
                flag3 = true;
              }
              img.width = 50;
              img.src = html;
            }
          }else{
            //なにもしない
          }

        },
        error: function() {
          //これはPHP叩くこと自体に失敗してる場合なので……
          console.log("リクエスト失敗 download");
          // エラーが返ってきた場合の処理
        }
      });
    })(forCount);

  }
}

//画像がアイコンっぽいかチェックする

function check_img(src, img, t, date, words_i){
   console.log("check cgi");
  if (flag5 == false){
    console.timeEnd("calling check_img");
    flag5 = true;
  }


  if (flag1 == false){
    console.time("starting checking");
  }


  flag = false;

  var contents = {
    src: src
  }
  contents = JSON.stringify(contents);

  //ajaxからPHPを叩く
  $.ajax({
    //async: false,
    type: 'POST',
    url: './cgis/check.cgi', // 実行するPHPの相対パス
    contentType:'application/json',
    cache: false,
    data: contents, // PHPに渡すデータ。↑で定義。PHPでは$_POST['sender_name']のように、通常フォーム送信された時と同じように値が取得できる。
    success: function(html) {
      //console.log(html);
      // 特にエラーが無くPHPが実行された後に実行する処理
      // jQueryなどが記述可能
      // 引数の html は予約語（決められた名前）で、実行したPHPのecho命令（複数可）などで出力された内容が格納されている。
      //console.log(html);
      if (html){
        //console.log(html);
        //htmlが0で無ければ（＝読み込み成功）
        var result = parseInt(html.result);
        //console.log(result)
        if (result == 1){
          flag = true;
          if (flag2 == false){
            console.timeEnd("check img");
            flag2 = true;
          }
          if (words_i == 0){
            set_img_to_egg_first(img, t, date);
          }

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
      console.log("リクエスト失敗 check img");
      flag = false;
      return;
      //change_tab(1);
      // エラーが返ってきた場合の処理
    },
    beforeSend:function(){
      if (flag1 == false){
        console.timeEnd("starting checking");
        flag1 = true;
      }
      if (flag2 == false){
        console.time("check img");
      }

    }
  });

//console.log(flag)
return flag;

}
