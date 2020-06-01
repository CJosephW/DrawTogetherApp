let Drawing = false;
let x = 0;
let y = 0;
let drawcolor = 'black'
const canvas = document.getElementById("draw-canvas");
const context = canvas.getContext('2d');

const chatBox = document.getElementById("chat-list");
let username = ($('#username-input').val());
let cursorSquare = [];
session_id = '';
let tool = "pencil";

let layer_one = {
    events:[],
    type: "drawing"
}
console.log(layer_one.events);

window.onload = init;

function init(){


    window.requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp){
    draw();
    window.requestAnimationFrame(gameLoop);
    
}
function draw(){

    if(layer_one.events.length > 0){
        for(item of layer_one.events){            
        drawSquare(context, item.x1, item.y1, item.color)
    }
    }
    
    drawSquare(context, cursorSquare[0], cursorSquare[1], cursorSquare[2])
}

var ws = new WebSocket('ws://localhost:40510')

$('#blue').on('click', function(event){//button functions for different colors
    drawcolor = '#3636e7'
});
$('#black').on('click', function(event){
    drawcolor = 'black'
});
$('#red').on('click', function(event){
    drawcolor = 'red'
});
$('#green').on('click', function(event){
    drawcolor = 'green'
});
$('#pencil').on('click', function(event){
    tool = "pencil"
});
$('#eraser').on('click', function(event){
    tool = "eraser"
});

$(document).click(function(e) {// will not continue drawing if off the canvas
    var target = $(e.target);

    if( !target.is("#draw-canvas") && target.closest("#draw-canvas").length === 0 ) {
        Drawing = false;
    }
});

$('#chat-form').submit(function() { //sends chat to server
    var chatValue = ($('#chat-input').val());
    if(chatValue != ""){//making sure empty chats are not sent
        ws.send(JSON.stringify({
            user: username,
            type: "chat",
            chat_message: chatValue,
            session_id: session_id
        }));
        document.getElementById('chat-input').value = '';
    }
    return false;//return false or else it attempts to reload the client    
});

$('#username-form').submit(function(){//sets username
    username = ($('#username-input').val());
    return false;//return false or else it attempts to reload the client
})

const rect = canvas.getBoundingClientRect();

ws.onopen = function(){//on connect tell server to initialize the session with the current ID
    
    url = window.location.href
    id = url.split('/')[4];
    session_id = id;
    console.log('hello3');
    ws.send(JSON.stringify({
        type: 'initialize_client',
        session_id: id
    }));
}

ws.onmessage = function (msg){
    let messages = JSON.parse(msg.data)
    console.log(messages);
        
    if(messages.type === "catchup"){//getting previous drawing events
        console.log(msg)
        if(layer_one.events != undefined) {
            layer_one.events = messages.layer_one.events
        }
            
    } else if(messages.type === "drawing"){//getting new drawings
        if(layer_one.events.length != 0){

            layer_one.events = messages.layer_one.events;
        }
        
    } else if (messages.type === "chat"){//new chats
        chatBox.insertAdjacentHTML("beforeend", "<div class = 'message'> <div class = 'user'>"+ messages.username+":</div> <div class = 'message'><p>" +messages.chat_message+ "</p></div></div>");
    
    } else if (messages.type = "chat_logs"){//getting chat logs
        for(chat of messages.chat_logs){
            chatBox.insertAdjacentHTML("beforeend", "<div class = 'message'> <div class = 'user'>"+ chat.user+":</div> <div class = 'message'><p>" +chat.chat_message+ "</p></div></div>");
        }

    }

}


canvas.addEventListener('mousedown', e => {//on mouse down start a new events array and begin drawing
    /*strokesArray.events = [];
    strokesArray.session_id = session_id;
    strokesArray.color = color;
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    Drawing = true;*/
    if(tool ==="pencil"){
        console.log("fuck this shit");
        console.log(layer_one.events);
        layer_one.events.push({
            x1: Math.round((e.clientX - rect.left)/5) *5,
            y1: Math.round((e.clientY - rect.top)/5)*5,
            color: drawcolor
        });
    }
    else if(tool === "eraser"){
        for(i = 0; i < layer_one.events.length; i++){
            if(Math.round((e.clientX - rect.left)/5)*5 === layer_one[i].x1 && Math.round((e.clientY - rect.top)/5)*5 === layer_one[i].y1){
                console.log('match1');
                cleaned_array = layer_one.events.splice(i, 1);
                layer_one.events = cleaned_array;
            }
        }
    }
    

    Drawing = true;

});

canvas.addEventListener('mousemove', e => {//get x and y values everytime the client moves
    
    if(Drawing === true) {
        
        if(tool === "pencil"){
            
            layer_one.events.push({
                x1: Math.round((e.clientX - rect.left)/5) *5,
                y1: Math.round((e.clientY - rect.top)/5)*5,
                color: drawcolor
            });
        } else if(tool === "eraser"){
            for(i = 0; i < layer_one.length; i++){
                if(cursorSquare[0] === layer_one[i].x1 && cursorSquare[1] === layer_one[i].y1){
                    console.log('match');
                    cleanded_array = layer_one.events.splice(i, 1)
                    layer_one.events = cleaned_array;
                    break;
                
                }
            }
        }
        
    }

    context.clearRect(cursorSquare[0], cursorSquare[1], 5, 5);
    cursorSquare = [];

    cursorSquare.push(Math.round((e.clientX - rect.left)/5)*5, Math.round((e.clientY - rect.top)/5)*5 ,drawcolor);

});

canvas.addEventListener('mouseup', e => {//stop drawing and clear the events and color
    /*if(Drawing === true){
        drawLine(context, x, y, e.clientX - rect.left, e.clientY - rect.top, color);
        strokesArray.events = [];
        strokesArray.color = ""
        x = 0;
        y = 0; 
        
    }*/
    console.log("should not be drawing");
    Drawing = false;

    layer_one.type = "drawing";
    ws.send(JSON.stringify({
        layer_one: layer_one,
        session_id: session_id,
        type: "drawing"
    }));
    console.log(layer_one);
});

function drawLine(context, x1, y1, x2, y2, drawcolor){//strokes and sending them to the events 
    context.beginPath();
    context.strokeStyle = drawcolor;
    context.lineWidth = 2;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    if (Drawing === true){
        strokesArray.events.push({
            x1:x1,
            y1:y1,
            x2:x2,
            y2:y2,
        })
    }
    context.stroke();
    context.closePath();
}
function drawSquare(context, x1, y1, drawcolor){
    
    context.fillStyle = drawcolor;
    context.fillRect(Math.round(x1/5)*5, Math.round(y1/5)*5,5,5);
}