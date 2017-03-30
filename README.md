# grafie　備忘録

## 動作環境
サーバー上で動かしてブラウザから閲覧＆操作を行うようになっています。開発時はApacheでローカルサーバーを立ち上げて開発していましたが、Firefox51.0.1(64bit)とChrome56.0.2924.87 (64-bit)では動きました。サーバー上で.phpと.cgiと.pyが実行できるようになっていれば動かせるはずです。

OpenCV : HomeBrewを使ってインストール  
[ここ](http://qiita.com/daisukeokaoss/items/738566e9f24d114651ab)を見ながらやってたはず  
バージョンは2.4.13

Python : 2.7.11

OS : MacOS Sierra 10.12

その他入れたものは下で解説してます

---

## 必須ファイル
my_app直下にBingApi.php（$accountKeyにAPIキーを代入する）が無いと動きません。

---

## フォルダ構成

* **css_160801.css**
現システムで使っているCSS。

* **download.php**
指定されたURLから画像をダウンロードしてdownloadフォルダに入れる。

* **request.php**
Bing APIを使って結果を取得する。APIキーはBingApi.phpで$accountKeyに代入する。


### Wordnet

WordNet本体。https://wordnet.princeton.edu/wordnet/download/ から落としてきた中身そのまま（なはず）。  
grafieではdict/data.\*を走査して類語検索をしている。  

### cgis
CGIを放り込んでいるフォルダのはずだけどここに入ってないものもちらほら。

* **check.cgi**
システムから呼び出している、与えられた画像がピクトグラムかどうか判定してるcgi。中身はPython。
search.js内のcheck_imgから呼び出されている。

```var contents = {  
  src: src  
}  
contents = JSON.stringify(contents);  
```

srcは画像へのパス、srcを持ったオブジェクトをJSON.stringfyでJSON化しcontentsをdataとしてajaxからこれを呼び出している。
返り値はhtml.resultで取ることが出来、1（文字列）か0（文字列）になっている。

* **make_white.cgi**
読み込みが失敗した時に白い画像を作る。現システムでは使われていない。

* **test.py**
ajax使った呼び出し練習。現システムでは使われていない。

* **upload.php**
アップロード機能を作ろうとして挫折した。現システムでは使われていない。

### css

* **/.sass-cache**
scssを使っていた頃の名残。結局現システムでは使われていないため意味がない（はず）。

* **/remodal**
http://vodkabears.github.io/remodal/ そのまま。現システムでは使われていない。

* **jquery.minicolors.css**

* **jquery.minicolors.png**
旧システムで使ってたカラーピッカーの名残。

* **main.min.css**
旧システムのcss。

* **main.scss**
旧システムのscss.。

### download
ダウンロードされた画像が入るフォルダ。ファイル名はdlinput\_(紐付け先のdivのid)\_（何枚目か）\_（何番目の類語か）になっている
。

### img
旧システムで使ってた画像集。現システムでは使われていない。

### javascripts
主に旧システムで使ったJavascriptを入れているフォルダ。

### js
主に現システムで使っているJavascriptを入れているフォルダ。

* **/farbtastic**
現システムで使っているカラーピッカー。https://acko.net/blog/farbtastic-jquery-color-picker-plug-in/

* **/colorpicker**
使おうかと考えていたけど結局使わなかったカラーピッカー。

* **context_menu_function.js**
右クリックして表示させるメニューをクリックした時に実行される関数。

* **contextmenu.js**
右クリックして表示させるメニューを表示させる関数。http://www.trendskitchens.co.nz/jquery/contextmenu/

* **mypaperscript.js**
画像がダウンロードされてからキャンバスに表示されるまで、およびグラフの描画機能などの関数が入っている。

* **onload.js**
ページが表示された際の処理を行う関数、およびグローバル変数の定義。

* **paper-full.min.js**
[paper.js](http://paperjs.org/)のファイル。

* **right_menu_js**
現システムの右部に出てくるメニューの機能を実装している関数が記述されている。

* **search.js**
選択された単語からBing APIを使って画像のダウンロード、および画像がピクトグラムであるかどうか判定する関数を呼び出す。

* **synonym.js**
選択された単語の類語を探す。

### ml
識別機の中身。cgis/check.cgiから呼び出されている。


### my_app直下

* **css_160801.css**
現行システムで使っているcss。

* **download.php**
指定されたURLから画像をダウンロードし指定されたファイル名で保存する。

* **handsontable.full.min.js**
[handsontable](https://handsontable.com/)。旧システムで表を扱うのに使っていたが現システムでは使われていない。

* **main_160801.html**
現行システムのhtmlファイル。

* **main.html**
旧システムのhtmlファイル。

* **request.php**
BING Search APIを呼び出して、受け取ったクエリで画像検索を行いその結果を返す。同じ階層にBingApi.php（$accountKeyにAPIキーを代入するだけ）が無いと動かない。

* **search_wordnet.cgi**
WordNetを走査して類語を見つける。
