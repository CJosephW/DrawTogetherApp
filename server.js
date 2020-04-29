var express = require('express')
var app = express()

let canvasStrokes = [];
let chatLogs = [];
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
    ws.send(JSON.stringify({
        type: "chat_logs",
        chat_logs: chatLogs

    }))
    console.log(canvasStrokes);
    ws.on('message', function (message, sender) {
        
        let msg = JSON.parse(message);//this is correct do not touch

        console.log(msg);
        

        if (msg.type === "drawing"){
            canvasStrokes.push(msg);
            sendAllButSender(JSON.stringify({
                type: "drawing",
                draw_event: msg
            }), ws);//sends to all excluding sender 
        } 
        else if (msg.type === "chat"){
            chatLogs.push(msg);
            console.log("chat recieved");
            sendAll(JSON.stringify({
                username: msg.user,
                type: "chat",
                chat_message: msg.chat_message
            }))
        } 
  
    })


})
function sendAllButSender (message, sender) {
    for (var i=0; i<CLIENTS.length; i++) {
        if(CLIENTS[i] !== sender){
            CLIENTS[i].send(message);
        }
    }
}
function sendAll (message) {
    for (var i=0; i<CLIENTS.length; i++) {
        CLIENTS[i].send(message);
    }
}