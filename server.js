var express = require('express')
var app = express()

app.use('/', express.static(__dirname + '/client'));


app.listen(3000, function() {
    console.log('App listening on port 3000!')
})

const WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 40510})
    CLIENTS = [];

wss.on('connection', function(ws) {
    CLIENTS.push(ws);
    ws.on('message', function (message) {
        let msg = JSON.parse(message);//this is correct do not touch

        sendAll(JSON.stringify(msg));
    })


})
function sendAll (message) {
    for (var i=0; i<CLIENTS.length; i++) {
        CLIENTS[i].send(message);
    }
}