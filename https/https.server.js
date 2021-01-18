"use strict";

let http = require("http");
let https = require("https");
let fs = require("fs");

let serveIndex = require("serve-index");

let express = require("express");
let app = express();

//顺序不能换
app.use(serveIndex("./public"));
app.use(express.static("./public"));

let options = {
    key: fs.readFileSync("./cert/cert.key"),
    cert: fs.readFileSync("./cert/cert.pem"),
};

let https_server = https.createServer(options, app);
https_server.listen(443, "localhost");

let http_server = http.createServer(app);
http_server.listen(80, "localhost");
