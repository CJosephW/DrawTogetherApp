let Drawing = false;
let x = 0;
let y = 0;
let color = 'black'

const canvas = document.getElementById("draw-canvas");
const blueBrush = document.getElementById("blue");
const blackBrush = document.getElementById("black");
const context = canvas.getContext('2d');

let strokesArray = [];

var ws = new WebSocket('ws://localhost:40510')

$('#blue').on('click', function(event){
    color = "#FF0000"
});


const rect = canvas.getBoundingClientRect();

ws.onmessage = function (msg){
    let message = JSON.parse(msg.data)
    console.log(message);
    if(message[0].x1 != null){

        console.log(message[0].x1);
        for(i = 0; i < message.length; i++){
            console.log(message[i].x1+ "hello")
            drawLine(context, message[i].x1, message[i].y1, message[i].x2, message[i].y2);
        }
    }
}

canvas.addEventListener('mousedown', e => {
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    Drawing = true;
});

canvas.addEventListener('mousemove', e => {
    if(Drawing === true) {
        drawLine(context, x, y, e.clientX - rect.left, e.clientY - rect.top);
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
});

canvas.addEventListener('mouseup', e => {
    if(Drawing === true){
        drawLine(context, x, y, e.clientX - rect.left, e.clientY - rect.top);
        for(item of strokesArray){
            console.log(item.x1);
        }
        ws.send(JSON.stringify(strokesArray));
        strokesArray = [];
        x = 0;
        y = 0; 
        Drawing = false;

    }
});

function drawLine(context, x1, y1, x2, y2){
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    strokesArray.push({
        x1:x1,
        y1:y1,
        x2:x2,
        y2:y2,
    })
    context.stroke();
    context.closePath();
}