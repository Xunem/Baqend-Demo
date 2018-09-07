
var clickCount = 0;
var count = 0;
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var colorPurple = "#cb3594";
var colorGreen = "#659b41";
var colorYellow = "#ffcf33";
var colorBrown = "#986928";

var curColor = colorPurple;
var clickColor = new Array();
var paint;
var c = document.getElementById("drawCanvas");
var context = c.getContext("2d");

var app = 'real-time-benchmark';
var refreshIntervalId;
DB.connect(app);

DB.ready(function () {
    $('#resetDraw').click(function(e){
        context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
        clickCount = 0;
        count = 0;
        clickX = [];
        clickY = [];
        clickDrag = [];
        query = DB.DrawPoint.find();
        temp = [];
        subscription = query.resultStream(result => {
            for(var temp in result){
                result[temp].delete();
            }
        });

    });
});


$('#drawCanvas').mousedown(function(e){
    var mouseX = e.pageX - this.offsetLeft;
    var mouseY = e.pageY - this.offsetTop;
            
    paint = true;
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    redraw();
});

$('#drawCanvas').mousemove(function(e){
if(paint){
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
    redraw();
}
});

$('#drawCanvas').mouseup(function(e){
    paint = false;
    clickCount = 0;
});

$('#drawCanvas').mouseleave(function(e){
    paint = false;
    clickCount = 0;
});


function addClick(x, y, dragging)
{
    if(clickCount%4 == 0){
        var point = new DB.DrawPoint({
            pid:"p"+count,
            x: x,
            y: y,
            dragging: dragging,
            ts: Date.now(),
            c: count
        });
        point.save();
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
    }
    clickCount++;
    count++;
}

function redraw(){
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
    
    context.strokeStyle = "#df4b26";
    context.lineJoin = "round";
    context.lineWidth = 5;
              
    for(var i=0; i < clickX.length; i++) {		
      context.beginPath();
      if(clickDrag[i] && i){
        context.moveTo(clickX[i-1], clickY[i-1]);
       }else{
         context.moveTo(clickX[i]-1, clickY[i]);
       }
       context.lineTo(clickX[i], clickY[i]);
       context.closePath();
       context.stroke();
    }
  }