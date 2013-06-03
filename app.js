var express = require("express");
var app = express();

app.use(express.logger());
app.use(express.static(__dirname + "/default"));
app.use(express.static(__dirname));

app.listen(process.env.PORT || 8888);

console.log("Neonatal app is running, open browser and navigate to localhost:8888");
console.log("Leave this terminal running.");
