// 指定行のデータを取得（配列）
//$('#table').handsontable('getDataAtRow',0);
function add_row(){
  var rowIndex = table_data.length;
  if(rowIndex != 8){
    hot.alter("insert_row", rowIndex);
  }
}

function delete_row(){
  var rowIndex = table_data.length;
  if(rowIndex != 1){
      hot.alter("remove_row", rowIndex - 1);
  }
}

function add_column(){
  var colIndex = table_data[0].length;
  hot.alter("insert_col", colIndex);
}

function delete_column(){
  var colIndex = table_data[0].length;
  hot.alter("remove_col", colIndex - 1);
}
