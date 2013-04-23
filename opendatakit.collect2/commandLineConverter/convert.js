load("js-xlsx/jszip.js", "js-xlsx/xlsx.js", "underscore.js", "XLSXConverter.js");
var path = arguments[0];
var data = System.IO.file.ReadAllBytes(path);
print(data);
/*
var xlsx = XLSX.read(data, {type: 'binary'});
var jsonWorkBook = to_json(xlsx);
var processedWorkbook = XLSXConverter.processJSONWorkbook(jsonWorkbook);
var jsonString = JSON.stringify(processedWorkbook, 2, 2);
print(jsonString);
*/
