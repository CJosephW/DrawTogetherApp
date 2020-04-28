var express = require('express')
var app = express()

let canvasStrokes = [];
app.use('/', express.static(__dirname + '/client'));


app.listen(3000, function() {
    console.log('App listening on port 3000!')
})

const WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 40510})
    CLIENTS = [];

wss.on('connection', function(ws) {
    
    CLIENTS.push(ws);
    
    ws.send(JSON.stringify({
        type: "catchup",
        all_draw_events: canvasStrokes
    }));
    console.log(canvasStrokes);
    ws.on('message', function (message, sender) {
        
        let msg = JSON.parse(message);//this is correct do not touch

        console.log(msg);
        canvasStrokes.push(msg);
        

        sendAll(JSON.stringify({
            type: "drawing",
            draw_event: msg
        }), ws);//sends to all excluding sender 
    })


})
function sendAll (message, sender) {
    for (var i=0; i<CLIENTS.length; i++) {
        if(CLIENTS[i] !== sender){
            CLIENTS[i].send(message);
        }
    }
}