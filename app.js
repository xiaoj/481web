var express = require("express");
var app = express();

app.use(express.logger());
app.use(express.static(__dirname + "/default"));
app.use(express.static(__dirname));

app.listen(process.env.PORT || 8888);
