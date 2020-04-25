var express = require('express')
var app = express()

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/ws.html');
})

app.listen(3000, function() {
    console.log('App listening on port 3000!')
})

const WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 40510})

wss.on('connection', function(ws) {
    ws.on('message', function (message) {
        console.log('received: %s', message)
    })

    setInterval ( 
        () => ws.send('${new Date ()}'),
        1000
    )
})