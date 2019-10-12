var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var osm = require("os-monitor");
require('loadavg-windows');
var fileupload = require('express-fileupload');
const netList = require('network-list');
const si = require('systeminformation');
app.use(fileupload());

var cors = require ('cors');
app.use(cors({
    origin:['http://localhost:4200','http://127.0.0.1:4200'],
    credentials:true
}));

app.use(function (req, res, next) {

  res.header('Access-Control-Allow-Origin', "http://localhost:4200");
  res.header('Access-Control-Allow-Headers', true);
  res.header('Access-Control-Allow-Credentials', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
});

http.listen(3000, () => {
    console.log("Server running");
}); 

io.on('connect', function (socket) {
    socket.emit('connected', {
        status: 'connected',
        type: osm.os.type(), 
        cpus: osm.os.cpus(),
    });
});
 
io.on('disconnect', function (socket) {
    socket.emit('disconnected');
});
 
 
osm.start({
    delay: 3000 // interval in ms between monitor cycles
    , stream: false // set true to enable the monitor as a Readable Stream
    , immediate: false 
}).pipe(process.stdout);
 
 
// define handler that will always fire every cycle
osm.on('monitor', function (monitorEvent) {
    io.emit('os-update', monitorEvent);
    //console.log(monitorEvent);
});


app.post("/upload", function(req, res, next) {
    const file = req.files.exefile;
    file.mv('./uploads/' + file.name, function(err, result) {
     if(err) 
      throw err;
     res.send({
      success: true,
      message: "File uploaded!"
     });
    })
   })

app.get('/devices', function(req,res,next){
    netList.scan({}, (err, arr) => {
        if(err)
            throw err;
        res.send({
            success: true,
            message: arr
           });
    });

})


app.get('/cpuinfo', function(req,res,next){
    si.cpu()
    .then(data => res.send({
        success: 200,
        message: data
       }))
    .catch(error => console.error(error));

})

app.get('/systeminfo', function(req,res,next){
    si.system()
    .then(data => res.send({
        success: 200,
        message: data
       }))
    .catch(error => console.error(error));

})


app.get('/osinfo', function(req,res,next){
    si.osInfo()
    .then(data => res.send({
        success: 200,
        message: data
       }))
    .catch(error => console.error(error));

})