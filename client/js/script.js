let Drawing = false;
let x = 0;
let y = 0;
let color = 'black'

const canvas = document.getElementById("draw-canvas");
const context = canvas.getContext('2d');
const chatBox = document.getElementById("chat-list");
let strokesArray = {};
strokesArray.type = "drawing";

var ws = new WebSocket('ws://localhost:40510')

$('#blue').on('click', function(event){
    color = '#3636e7'
});
$('#black').on('click', function(event){
    color = 'black'
});
$('#red').on('click', function(event){
    color = 'red'
});
$('#green').on('click', function(event){
    color = 'green'
});

$(document).click(function(e) {
    var target = $(e.target);

    if( !target.is("#draw-canvas") && target.closest("#draw-canvas").length === 0 ) {
        Drawing = false;
    }
});
$('#chat-form').submit(function() { 
    var chatValue = ($('#chat-input').val());
    console.log(chatValue);
    ws.send(JSON.stringify({
        type: "chat",
        chat_message: chatValue
    }));
    return false;
});





const rect = canvas.getBoundingClientRect();

ws.onmessage = function (msg){
    let messages = JSON.parse(msg.data)
    console.log(messages);
    
    
    if(messages.type === "catchup"){
        for(message of messages.all_draw_events){
            console.log(message)
            for(i = 0; i < message.events.length; i++){
                console.log(message.events[i].x1+ "hello")
                drawLine(context, message.events[i].x1, message.events[i].y1, message.events[i].x2, message.events[i].y2, message.color);
                }
            }
        }
    if(messages.type === "drawing"){
        for(message of messages.draw_event.events){
            console.log(message+ "hello")
            drawLine(context, message.x1, message.y1, message.x2, message.y2, messages.draw_event.color);
        }
    } else if (messages.type === "chat"){
        let chatP = document.createElement("p");

        chatBox.insertAdjacentHTML("beforeend", "<div class = 'message'> <div class = 'user'>Username: </div> <div class = 'message'><p>" +messages.chat_message+ "</p></div></div>");
    }
}

canvas.addEventListener('mousedown', e => {
    strokesArray.events = [];

    strokesArray.color = color;
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    Drawing = true;
});

canvas.addEventListener('mousemove', e => {
    if(Drawing === true) {
        drawLine(context, x, y, e.clientX - rect.left, e.clientY - rect.top, color);
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
});

canvas.addEventListener('mouseup', e => {
    if(Drawing === true){
        drawLine(context, x, y, e.clientX - rect.left, e.clientY - rect.top, color);
        ws.send(JSON.stringify(strokesArray));
        strokesArray.events = [];
        strokesArray.color = ""
        x = 0;
        y = 0; 
        Drawing = false;

    }
});

function drawLine(context, x1, y1, x2, y2, drawcolor){
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