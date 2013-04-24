var express = require("express");
var app = express();

app.use(express.logger());
app.use(express.static(__dirname + "/opendatakit.collect2/form-files/default"));
app.use(express.static(__dirname + "/opendatakit.collect2/form-files"));

app.listen(process.env.PORT || 8888);
