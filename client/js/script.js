let Drawing = false;
let x = 0;
let y = 0;
let color = 'black'

const canvas = document.getElementById("draw-canvas");
const context = canvas.getContext('2d');
const chatBox = document.getElementById("chat-list");
let username = ($('#username-input').val());
let strokesArray = {};
strokesArray.type = "drawing";
session_id = '';

var ws = new WebSocket('ws://localhost:40510')

$('#blue').on('click', function(event){//button functions for different colors
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

    ws.send(JSON.stringify({
        type: 'initialize_client',
        session_id: id
    }));
}

ws.onmessage = function (msg){
    let messages = JSON.parse(msg.data)
        
    if(messages.type === "catchup"){//getting previous drawing events
        console.log(msg)
        for(message of messages.all_draw_events){
            for(i = 0; i < message.events.length; i++){
                console.log(message.events[i].x1+ "hello")
                drawLine(context, message.events[i].x1, message.events[i].y1, message.events[i].x2, message.events[i].y2, message.color);
                }
            }
    } else if(messages.type === "drawing"){//getting new drawings
        for(message of messages.draw_event.events){
            console.log(message+ "hello")
            drawLine(context, message.x1, message.y1, message.x2, message.y2, messages.draw_event.color);
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
    strokesArray.events = [];
    strokesArray.session_id = session_id;
    strokesArray.color = color;
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    Drawing = true;
});

canvas.addEventListener('mousemove', e => {//get x and y values everytime the client moves
    if(Drawing === true) {
        drawLine(context, x, y, e.clientX - rect.left, e.clientY - rect.top, color);
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
});

canvas.addEventListener('mouseup', e => {//stop drawing and clear the events and color
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