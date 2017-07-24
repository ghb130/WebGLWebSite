//==============================================================================
//ENGINE STATE OBJECT
//Helps keep track of state variables.
//==============================================================================
function EngineState(){
  this.initialized = false;
}
//==============================================================================
//TIMEKEEPER OBJECT
//Holds usefull information about time
//==============================================================================
function TimeKeeper(){
  this.initTime = Date.now();
  this.lastFrame = this.initTime;
  this.deltaTime = 0;
  this.frameRate = 0;
  this.ticked = false
  this.update = function(){
    this.deltaTime = Date.now()-this.lastFrame;
    this.lastFrame = Date.now();
    this.frameRate = Math.round((1000/this.deltaTime)*10)/10;
    if(!this.ticked){
      this.ticked = true;
      window.setTimeout(()=>{
        document.getElementById("frameRateText").innerHTML = this.frameRate.toString();
        Engine.TimeKeeper.ticked = false;
      }, 500);
    }
  }
}
//==============================================================================
//TRANSFORM OBJECT
//Maintains information about an objects position in space.
//==============================================================================
function Transform(){
  this.position = vec3.create();
  this.scale = vec3.create();
  this.rotation = quat.create();
}
//==============================================================================
//MATRIX STACK
//Maintains a general purpose stack for use with gl-matrix
//==============================================================================
function Stack(){
  this.stack = [];
  this.push = function(matrix){
    this.stack.push((typeof matrix).clone(matrix));
  }
  this.pop = function(){
    return this.stack.pop();
  }
}
//==============================================================================
//REMOVE LOADING TEXT
//==============================================================================
function doneLoading() {
  var x = document.getElementById('LoadingText');
  x.style.display = 'none';
}
