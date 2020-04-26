let Drawing = false;
let x = 0;
let y = 0;
let color = 'black'

const canvas = document.getElementById("draw-canvas");
const blueBrush = document.getElementById("blue");
const blackBrush = document.getElementById("black");
const context = canvas.getContext('2d');

let strokesArray = {};


var ws = new WebSocket('ws://localhost:40510')

$('#blue').on('click', function(event){
    color = '#3636e7'
});


const rect = canvas.getBoundingClientRect();

ws.onmessage = function (msg){
    let message = JSON.parse(msg.data)
    console.log(message);
    if(message.events[0].x1 != null){

        for(i = 0; i < message.events.length; i++){
            console.log(message.events[i].x1+ "hello")
            drawLine(context, message.events[i].x1, message.events[i].y1, message.events[i].x2, message.events[i].y2, message.color);
        }
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
        for(item of strokesArray.events){
            console.log(item.x1);
        }
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