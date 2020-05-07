const express = require('express')
const path = require('path');
const WebSocetServer = require('ws').Server
const {v1 : uuidv1} = require('uuid');
let CLIENTS = [];
var app = express()

app.use('/', express.static(__dirname + '/client'));
app.get('/', function(req, res) {
    // Create a unique id
    // Redirect them to /draw/id
    var id = uuidv1();//unique id based off of id
    res
        .set('Cache-Control', 'public, max-age=0')
        .redirect(302, `/draw/${id}`);//giving users unique id URLS for friends to join off of
});

app.get('/draw/:id', function(req, res) {
    res.sendFile(__dirname + '/client/app.html');//serve our html
}); // Server for ids

app.listen(3000, function(){
    console.log('app listening at port 3000');
})

wss = new WebSocetServer({port:40510})
// Basic structure
var SESSIONS = {}

wss.on('connection', function(ws){
    CLIENTS.push(ws);
    ws.on('message', function(message, sender){
        let msg = JSON.parse(message);
        
        if (msg.type == "initialize_client"){
            if (!SESSIONS[msg.session_id]) {//if the session does not already exist prevents overwrite on rejoin/joiners
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
            ws.send(JSON.stringify({
                type: "chat_logs",
                chat_logs: SESSIONS[msg.session_id].chat_messages
            }))
        }
        else if (msg.type == "drawing"){
            SESSIONS[msg.session_id].strokes.push({
                events: msg.events,
                color: msg.color,

            });
        }
        else if(msg.type = 'chat'){
            SESSIONS[msg.session_id].chat_messages.push({
                user: msg.user,
                chat_message: msg.chat_message
            });
            sendAll(JSON.stringify({
                type: 'chat',
                username: msg.user,
                chat_message: msg.chat_message
            }));
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