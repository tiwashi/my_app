onmessage = function(e){
  var url_arr = e.data.url_arr;
  var t = e.data.id;
  var date = e.data.date
  var i = e.data.i;

  var contents = {
    object : url_arr[i],
    num1 : t,
    num2 : i
  };

  //ajaxからPHPを叩く
  var obj = new XMLHttpRequest();

  obj.onreadystatechange = function(){
    if (obj.readyState == 4){
      var html = obj.responseText;

      var src = html.match(/\.png$/);

      if (src != null){

        //var check = check_img(html, date);
        check_img(html, date, t);
          //set_img_to_egg_first(img, t, date);
      }else{
        console.log("none");
      }
    }else{
    }
  };

    obj.open('POST', '../download.php', false);
    obj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    obj.send("object=" + url_arr[i] + "&num1=" + t + "&num2=" + i);
}

//画像がアイコンっぽいかチェックする
function check_img_(src, date,  t){

  flag = false;

  var contents = {
    src: src
  }
  contents = JSON.stringify(contents);

  var obj = new XMLHttpRequest();

  obj.onreadystatechange = function(){
    if (obj.readyState == 4){
      var html = obj.responseText;
      //htmlが0で無ければ（＝読み込み成功）
      var result = parseInt(html);
      //console.log(result)
      if (result == 1){
        flag = true;
      }else {
        flag = false;
      }

      if (flag == true){
        var e = {
          id : t,
          src : src,
          date : date
        };
        postMessage(e);
      }
    }
  };

    obj.open('POST', '../cgi-bin/check.cgi', false);
    obj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    obj.send("src=." + src);
  }
