const express = require('express')
const path = require('path');
const WebSocetServer = require('ws').Server
const {v1 : uuidv1} = require('uuid');

var app = express()

app.use('/', express.static(__dirname + '/client'));
app.get('/', function(req, res) {
    // Create a unique id
    // Redirect them to /draw/id
    var id = uuidv1();
    res
        .set('Cache-Control', 'public, max-age=0')
        .redirect(302, `/draw/${id}`);
    
});

app.get('/draw/:id', function(req, res) {
    res.sendFile(__dirname + '/client/app.html');
}); // Server for ids

app.listen(3000, function(){
    console.log('app listening at port 3000');
})

wss = new WebSocetServer({port:40510})

// Basic structure
var SESSIONS = {
    "sessionID": {
        clients: [],
        strokes: [],
        chat_messages: []
    }
}

wss.on('connection', function(ws){
    ws.on('message', function(message, sender){
        let msg = JSON.parse(message);
        
        if (msg.type == "initialize_client"){
            if (!SESSIONS[msg.session_id]) {
                SESSIONS[msg.session_id] = {
                    clients:[],
                    strokes:[],
                    chat_messages:[]
                }
            }
            ws.send(JSON.stringify({
                type: "catchup",
                all_draw_events: SESSIONS[msg.session_id].strokes
            }));
        }

        else if (msg.type == "drawing"){
            SESSIONS[msg.session_id].strokes.push({
                events: msg.events,
                color: msg.color,

            });
        }

        console.log(msg);
    })
})