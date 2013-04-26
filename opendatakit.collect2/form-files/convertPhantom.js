// ./phantomjs convertPhantom.js [xlsx form] > [form def]
var fs = require('fs');
var system = require('system');
var read_stream = fs.open(system.args[1], 'rb');
var contents = read_stream.read();

var page = require('webpage').create();
page.open("http://uw-ictd.github.io/XLSXConverter/", function() {
  var jsonString = page.evaluate(function(contents) {
    var xlsx = XLSX.read(contents, {type: 'binary'});
    var jsonWorkbook = to_json(xlsx);
    var processedWorkbook = XLSXConverter.processJSONWorkbook(jsonWorkbook);
    return JSON.stringify(processedWorkbook, 2, 2);
  }, contents);
  console.log(jsonString);
  phantom.exit();
});
