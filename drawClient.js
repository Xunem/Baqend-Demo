
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var colorPurple = "#cb3594";
var colorGreen = "#659b41";
var colorYellow = "#ffcf33";
var colorBrown = "#986928";

var points = [];

var curColor = colorPurple;
var clickColor = new Array();
var paint;
var c = document.getElementById("myCanvas");
var context = c.getContext("2d");
var app = 'real-time-benchmark';
DB.connect(app);
DB.ready(function(){
    query = DB.DrawPoint.find()
    .descending('ts')
    .limit(13);
    subscription = query.eventStream().subscribe(event => handle(event));
});

points.sort(function(a,b){
  if(parseInt(a.ts) != parseInt(b.ts)){
    return parseInt(a.ts) - parseInt(b.ts);
  }
  return parseInt(a.count) - parseInt(b.count);
});

function handle(event){
    if(event.matchType === 'add'){
      addPoint(event.data);
      redraw();
    } else if(event.matchType === 'remove'){
      removePoint(event.data.pid);
      
    }
    
}

function addClick(x, y, dragging)
{

    clickX.push(x);
    clickY.push(y);
    clickDrag.push(dragging);
}

function addPoint(data){
    points[data.pid] = {
      "x":data.x,
      "y":data.y,
      "dragging":data.dragging,
      "ts":data.ts
    }
}

function removePoint(id){
  console.log(delete points[id]);
  console.log(points);
  redraw();
}

function redraw(){
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
    
    context.strokeStyle = "#df4b26";
    context.lineJoin = "round";
    context.lineWidth = 5;

    points.sort();
    
    var lastPoint;
    for(var pointKey in points){
      var point = points[pointKey];
      context.beginPath();
      if(point.dragging && lastPoint){
        context.moveTo(lastPoint.x,lastPoint.y);
      }else{
        context.moveTo(point.x-1,point.y);
      }
      context.lineTo(point.x, point.y);
      context.closePath();
      context.stroke();
      lastPoint = point;
    }
            
    /*for(var i=0; i < clickX.length; i++) {		
      context.beginPath();
      if(clickDrag[i] && i){
        context.moveTo(clickX[i-1], clickY[i-1]);
       }else{
         context.moveTo(clickX[i]-1, clickY[i]);
       }
       context.lineTo(clickX[i], clickY[i]);
       context.closePath();
       context.stroke();
    }*/
  }