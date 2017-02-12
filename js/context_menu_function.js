//contextmenuからsearchを選択した時
function contextmenu_search(t){
  //t...呼び出したエレメント

  if (sel_word == ""){
    alert("Select a word!");
    return false;
  }
  //alert("選択した文字列: " + sel_word);

  //待たせるの開始
  $('#myMenu1').hide();

  //ワードで検索する
  call_BING_API(sel_word, t, 0);
}

//待たせる時のいろいろをセット（true）したり解除(false)したり
function set_waiting_screen(flag){
  if (flag){
    //セット
    console.log("start");
    document.body.style.cursor = "wait";
    $("#loader-scr").show("normal");
    console.time("syori");
  }else{
    //解除
    console.log("end");
    document.body.style.cursor = "auto";
    $("#loader-scr").hide("normal");
    console.timeEnd("syori");
    //$("#loader-scr").css('display', 'none');
  }
}
