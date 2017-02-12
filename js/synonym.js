function search_syn(w, t, wb_i){
  //デバッグ用
  //var w = "happy";
  console.log(search_syn);
  w = w.toLowerCase();

  var contents = {
    word : w
  };
  contents = JSON.stringify(contents);

  console.time("searching syn");
  //Ajaxでphpを呼び出す
  $.ajax({
    //async: false,
    type: 'POST',
    url: './search_wordnet.cgi', // 実行するPHPの相対パス
    cache: false,
    data: contents, // PHPに渡すデータ。↑で定義。PHPでは$_POST['sender_name']のように、通常フォーム送信された時と同じように値が取得できる。
    success: function(html) {
      //console.log(html);
      // 特にエラーが無くPHPが実行された後に実行する処理
      // jQueryなどが記述可能
      // 引数の html は予約語（決められた名前）で、実行したPHPのecho命令（複数可）などで出力された内容が格納されている。

      //console.log(html);
      if (html){
        console.timeEnd("searching syn");
        console.log(html);
        if (html.result){
          if (html.result !== '0'){
            var syn = html.result.split(',');
            for (var i = 0; i < Math.min(syn.length, 5); i++){
              console.log("word net " + String(i) + "th " + syn[i]);
              word_bank[wb_i].push(syn[i]);
              /*
              var new_div = document.createElement('div');
              new_div.id = 'divcan_' + syn[i];
              $(new_div).addClass("candis_imgdiv");
              $('#candis').append(new_div);

              //選択用ラベル
              var btn = $("<input></input>", {
                //css: {border: "5px solid gray"},
                attr: {type: "radio", name: "candis_radio", id: "candis_" + String(i + 1)},
                addClass: "candis_radio",
                val: syn[i],
                on: {
                  change: function(event) {
                  }
                }
              });
              var lbl = $("<label></label>", {
                attr: {for: "candis_" + String(i + 1)},
                text: syn[i],
                on:{
                  click: function(e){
                    // イベント設定
                    console.log($(this).attr('for'));
                    $('#' + $(this).attr('for')).prop('checked', true);
                    console.log($('input[name=num_radio]:checked').val());
                  }
                }
              });
              $('#candis').append(btn);
              $('#candis').append(lbl);*/

              //画像検索
              call_BING_API(syn[i], t, i+1);

              //divに追加

            }
          }
        }
      }


    },
    error: function() {
      alert("search syn failed");
      return false;
      // エラーが返ってきた場合の処理
    }
  });
}
