//getting URL Parameters
var url_string = window.location.href;
var url = new URL(url_string);
var bp = url.searchParams.get("bp");      //Backend Provider
var clid = url.searchParams.get("clid");
var cid = url.searchParams.get("cid");    // Canvas-ID
var c = url.searchParams.get("c");        // Color
var x = url.searchParams.get("x");        // x-axis
var y = url.searchParams.get("y");        // y-axis 
var l = url.searchParams.get("l");        // limit

var supported = true;

var points = [];
var stamps = [];

if(bp === 'ba'){
  var app = 'real-time-benchmark';
  DB.connect(app);
  DB.ready(function(){
    console.log('Client '+clid+' connected');
    doQuery();
  });
} else if(bp === 'fb'){
  var config = {
    apiKey: "AIzaSyAutXeruAGoGxOSuTQSxBH-iVxHoN9K56k",
    authDomain: "fir-demo-aa3d1.firebaseapp.com",
    databaseURL: "https://fir-demo-aa3d1.firebaseio.com",
    projectId: "fir-demo-aa3d1",
    storageBucket: "fir-demo-aa3d1.appspot.com",
    messagingSenderId: "801259432549"
  };
  var defaultApp = firebase.initializeApp(config);
  doQuery();
}

var query;
var subscription;
var info;

function doQuery(){  
  if(!cid){
    if(!c && !x){
          if(l){
            info = "All Canvases<br>"+l+" lowest Z-Values";
            if(bp === 'ba'){
              query = DB.Point.find()
                .ascending('z')
                .limit(parseInt(10));
              subscription = query.eventStream().subscribe(event => handle(event));
            } else if(bp === 'fb'){
              supported = false;
              var temp = "<br><i>Not supported</i>";
              info = info.concat(temp);
            }
              
          }else{
            info = "All Canvases<br>All Points";
            if(bp === 'ba'){
              query = DB.Point.find();
              subscription = query.eventStream().subscribe(event => handle(event));
            } else if(bp === 'fb'){
              var cvs = firebase.database().ref('points/');
                cvs.on('child_added', function(data) {
                  var points = firebase.database().ref('points/'+data.key+'/');
                  points.on('child_added', function(data) {
                    add(data.val(), false);
                  });
                });
            }
          }
          
      }else{
          if(c){
            info = "All Canvases<br>Color "+c;
            if(bp === 'ba'){
              query = DB.Point.find()
                .equal('color', c);
              subscription = query.eventStream().subscribe(event => handle(event));
            } else if(bp === 'fb'){
              var cvs = firebase.database().ref('points/');
                cvs.on('child_added', function(data) {
                  var points = firebase.database().ref('points/'+data.key+'/');
                  points.orderByChild("color").equalTo(c).on("child_added", function(snapshot) {
                    add(snapshot.val(), false);
                  });
                });
                
            }
              
          }else{
              if(!y){
                info = "All Canvases<br>X over "+x; 
                if(bp === 'ba'){
                  query = DB.Point.find()
                    .greaterThan('x', parseInt(x));
                  subscription = query.eventStream().subscribe(event => handle(event));
                } else if(bp === 'fb'){
                  var cvs = firebase.database().ref('points/');
                  cvs.on('child_added', function(data) {
                    var points = firebase.database().ref('points/'+data.key+'/');
                    points.orderByChild("x").startAt(parseInt(x)).on("child_added", function(snapshot) {
                      add(snapshot.val(), false);
                    });
                  });
                }
                
              }else{
                info = "All Canvases<br>X over "+x+"<br>Y over "+y; 
                if(bp === 'ba'){
                  query = DB.Point.find()
                    .greaterThan('x', parseInt(x))
                    .greaterThan('y', parseInt(y));  
                  subscription = query.eventStream().subscribe(event => handle(event));
                } else if(bp === 'fb'){
                  supported = false;
                  var temp = "<br><i>Not supported</i>";
                  info = info.concat(temp);
                }
                
              }
          }
    }
  }else{
      if(!c && !x){
          if(l){
            info = "Canvas "+cid+"<br>"+l+" lowest Z-Values";
            if(bp === 'ba'){
              query = DB.Point.find()
                .equal('canvas', parseInt(cid))
                .ascending('z')
                .limit(l);
              subscription = query.eventStream().subscribe(event => handle(event));
            } else if(bp === 'fb'){
              var points = firebase.database().ref('points/'+cid+'/');
              points.orderByChild("z").limitToFirst(parseInt(l)).on("child_added", function(snapshot) {
                add(snapshot.val(), false);
              });
              points.orderByChild("z").limitToFirst(parseInt(l)).on("child_removed", function(snapshot) {
                remove(snapshot.val());
              });
            }
              
          }else{
            info = "Canvas "+cid+"<br>All Points";
            if(bp === 'ba'){
              query = DB.Point.find()
                .equal('canvas', parseInt(cid));
              subscription = query.eventStream().subscribe(event => handle(event));
            } else if(bp === 'fb'){
              var points = firebase.database().ref('points/'+cid+'/');
              points.on('child_added', function(data) {
                add(data.val(), false);
              });
            }
              
          }
          
      }else{
          if(c){
            info ="Canvas "+cid+"<br>Color "+c; 
            if(bp === 'ba'){
              query = DB.Point.find()
                .equal('canvas', parseInt(cid))
                .equal('color', c);
              subscription = query.eventStream().subscribe(event => handle(event));
            } else if(bp === 'fb'){
              var points = firebase.database().ref('points/'+cid+'/');
              points.orderByChild("color").equalTo(c).on("child_added", function(snapshot) {
                add(snapshot.val(), false);
              });
            }
              
          }else{
              if(!y){
                info = "Canvas "+cid+"<br>X over "+x; 
                if(bp === 'ba'){
                  query = DB.Point.find()
                    .equal('canvas', parseInt(cid))
                    .greaterThan('x', parseInt(x));
                    
                  subscription = query.eventStream().subscribe(event => handle(event));
                } else if(bp === 'fb'){
                  var points = firebase.database().ref('points/'+cid+'/');
                  points.orderByChild("x").startAt(parseInt(x)).on("child_added", function(snapshot) {
                    add(snapshot.val(), false);
                  });
                }
                
              }else{
                info = "Canvas "+cid+"<br>X over "+x+"<br>Y over "+y; 
                if(bp === 'ba'){
                  query = DB.Point.find()
                  .equal('canvas', parseInt(cid))
                  .greaterThan('x', parseInt(x))
                  .greaterThan('y', parseInt(y));  
                  subscription = query.eventStream().subscribe(event => handle(event));
                } else if(bp === 'fb'){
                  supported = false;
                  var temp = "<br><i>Not supported</i>";
                  info = info.concat(temp); 
                }
                
              }
          }
    }
  }

  if(!supported){
    document.body.style.backgroundColor = "GREY";
    document.getElementById("info").style.backgroundColor = "GREY";
  } 
  document.getElementById("info").innerHTML = info;   
}





function handle(event){
  if(event.matchType === 'add'){
    add(event.data, event.initial);
  } else if(event.matchType === 'remove'){
    remove(event.data);
  }
  
}

function add(point, initial){
  var ts = Date.now();
  points[point.pid] = point;
  redraw();
  if(!initial){
    stamps[point.pid] = {sent: point.ts, receive: ts};
    recalcLatency();
  }
}

function remove(point){
  delete points[point.pid];
  redraw();
}

function redraw(){
  var c = document.getElementById("myCanvas");
  var ctx = c.getContext("2d");
  ctx.clearRect(0,0,c.width,c.height);
  for(var key in points){
    var element = points[key];
    var color;
    switch(element.color){
        case "BLUE": 
            color = "#4AABE0";
            break;
        case "RED":
            color = "#FF7F7C";
            break;
        case "YELLOW":
            color = "#F7D100";
            break;
        case "GREEN":
            color = "#63C435";
            break;
    }
    
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(element.x,(300-element.y),element.z/10,0,2*Math.PI);
    ctx.fill();
    ctx.stroke();
  }
}

function recalcLatency(){
  var latency = 0;
  var count = 0;
  for(var key in stamps){
    latency += stamps[key].receive - stamps[key].sent;
    count++;
  }
  document.getElementById("latency").innerHTML = Math.floor((latency/count));
}