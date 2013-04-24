//load("js-xlsx/jszip.js", "js-xlsx/xlsx.js", "underscore.js", "XLSXConverter.js");
/*
var fs = require('fs');
require("./underscore.js");
require("./js-xlsx/jszip.js");
require("./js-xlsx/xlsx.js");
require("./XLSXConverter.js");
var system = require('system');

var page = require('webpage').create();
page.includeJS("./js-xlsx/xlsx.js", function() {
  //console.log(XLSX);
});
var read_stream = fs.open(system.args[1], 'rb');
var contents = read_stream.read();
//var xlsx_contents = xlsxNS.XLSX.read(contents, {type: 'binary'});
console.log(contents);
*/
/*
  var buffer = new Buffer(100);
  fs.read(fd, buffer, 0, 100, 0, function(err, num) {
    console.log(buffer.toString('utf-8', 0, num));
  });
  */
var fs = require('fs');
var system = require('system');
var read_stream = fs.open(system.args[1], 'rb');
var contents = read_stream.read();

var page = require('webpage').create();
page.open("http://uw-ictd.github.io/XLSXConverter/", function() {
  var foo = 42;
  var jsonString = page.evaluate(function(contents) {
    var xlsx = XLSX.read(contents, {type: 'binary'});
    var jsonWorkbook = to_json(xlsx);
    var processedWorkbook = XLSXConverter.processJSONWorkbook(jsonWorkbook);
    return JSON.stringify(processedWorkbook, 2, 2);
  }, contents);
  console.log(jsonString);
  phantom.exit();
});
