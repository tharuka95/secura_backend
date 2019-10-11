var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var osm = require("os-monitor");
require('loadavg-windows');
var fileupload = require('express-fileupload');
const netList = require('network-list');

app.use(fileupload());

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
