function upload_image_func(){
  var contents = {
    object : $('#upload_select').val()
  };
  console.log("upload_image");
  $.ajax({
    //async: false,
    type: 'POST',
    url: '../cgis/upload.php', // 実行するPHPの相対パス
    cache: false,
    data: contents, // PHPに渡すデータ。↑で定義。PHPでは$_POST['sender_name']のように、通常フォーム送信された時と同じように値が取得できる。
    success: function(html) {
      //console.log(html);
      // 特にエラーが無くPHPが実行された後に実行する処理
      // jQueryなどが記述可能
      // 引数の html は予約語（決められた名前）で、実行したPHPのecho命令（複数可）などで出力された内容が格納されている。

      //画像として貼る
      //var ras = new paper.Raster();


      console.log(html);

    },
    error: function() {
      alert("アップロード失敗");
      return false;
      // エラーが返ってきた場合の処理
    }
  });
}
