//==============================================================================
//ANIMPLAYER OBJECT
//Maintains information about the currently active animations
//==============================================================================
function AnimPlayer(){
  this.Animations = {};
  this.update = function(){
    for (var anim in this.Animations){
      if (this.Animations.hasOwnProperty(anim)){
        if(this.Animations[anim].finished){
          delete this.Animations[anim];
        }
        else{
          this.Animations[anim].update();
        }
      }
    }
  }
  this.addAnim = function(name, anim){
    this.Animations[name] = anim;
  }
}
//==============================================================================
//ANIMATION OBJECT
//Maintains information about an object and its current animation
//Rotation interpolation is always slerp
//Arguments:
//AnimInf - an instance of the animinf function which provides animation information.
//Flags:
var ANIM_PSR =    0b0000000000111;
var ANIM_POS =    0b0000000000001;
//0b0000000000001 - animate position
var ANIM_SCALE =  0b0000000000010;
//0b000000000010 - animate scale
var ANIM_ROT =    0b0000000000100;
//0b000000000100 - animate rotation
var INT_LINE =    0b0000000001000;
//0b000000001000 - linear interpolation
var INT_BEZ =     0b0000000010000;
//0b000000010000 - bezier interpolation
var INT_HERM =    0b0000000100000;
//0b000000100000 - hermite interpolation
var MULTI =       0b0000001000000;
//0b000001000000 - multiple objects
var REPEAT =      0b0000010000000;
//0b000010000000 - loop indefinitely
var BOUNCE =      0b0000100000000;
//0b000100000000 - Reverse animation when it reaches the end
var CIRCULAR =    0b0001000000000;
//0b000100000000 - similar to loop but will repeat starting at -1.0 percent
var REVERSED =    0b0010000000000;
//0b001000000000 - reverses direction of motion
var SMOOTHED =    0b0100000000000;
//0b010000000000 - whether or not to smooth the motion
var COMPOUND =    0b1000000000000;
//0b10000000000 - whether or not to reset the transform of the object at the end of the animation
//In the case that non linear interpolation is used, trans is expected to be an array of 3 transforms
//==============================================================================
function Animation(animInf){
  this.Object = animInf.Object;
  this.destTrans = animInf.Trans;
  this.initTrans = new Transform(this.Object.transform.position, this.Object.transform.scale, this.Object.transform.rotation);
  this.deltaTrans = new Transform();
  this.deltaTrans.copy(this.Object.transform);
  this.cachedTrans = new Transform();
  this.speed = animInf.speed;
  this.count = animInf.count;
  this.percent = 0.0;
  this.finished = false;
  this.upTick = true;

  var flags = animInf.flags;
  if(flags&REVERSED){this.direction = -1; this.reversed = true}
  else{this.direction = 1; this.reversed = false;}
  if(!(flags&CIRCULAR) && (flags&REVERSED)){this.curCount = -1;}
  else{this.curCount = 0;}
  this.compound = (flags&COMPOUND);
  this.circular = (flags&CIRCULAR);
  this.loop = (flags&REPEAT);
  this.bounce = (flags&BOUNCE);
  this.smoothed = (flags&SMOOTHED);
  this.smoothVectors = [vec3.fromValues(0,0,0), vec3.fromValues(0,1,0), vec3.fromValues(1,1,0), vec3.fromValues(1,0,0)];

  if(flags&INT_LINE){
    this.update = function(){
      if(this.percent > 1.00){
        if(this.circular){
          this.percent = -1.00;
          this.upTick = false;
        }
        else if(this.bounce && this.upTick){
          this.direction = this.direction*-1;
          this.upTick = false;
        }
        else if ((this.loop || this.curCount < this.count)&&!this.bounce) {
          this.percent = this.percent%1.00;
          this.curCount++;
        }
        else if (!this.bounce){
          this.finished = true;
        }
      }
      else if (this.percent < -1.00) {
        if(this.circular){
          this.percent = 1.00;
          this.upTick = false;
        }
        else{
          this.finished = true;
        }
      }
      else if ((!this.reversed && !this.upTick && this.percent > 0.00)||(this.reversed && !this.upTick && this.percent < 0.00)) {
        if(this.loop || this.curCount<this.count){
          this.upTick = true;
          this.curCount++;
        }
        else {
          this.finished = true;
        }
      }
      else if(this.percent < 0.00){
        if(this.circular){
          //do nothing since we want to go to -1.00
        }
        else if(this.loop && this.bounce && !this.uptick){
          this.direction = this.direction*-1;
          this.percent = 0.00001;
          this.curCount++;
          this.upTick = true;
        }
        else if (this.loop || this.curCount < this.count) {
          this.percent = 1.00;
          this.curCount++;
        }
        else{
          this.finished = true;
        }
      }
      if(this.curCount == this.count && !this.loop){
        this.finished = true;
      }
      if(!this.finished){
        //Compute percent done
        var addPercent = (this.speed*(Engine.TimeKeeper.deltaTime/1000))/100;
        this.percent += this.direction * addPercent;

        var perc = null;
        if(this.smoothed){
          var proxyTrans = vec3.create();
          vec3.bezier(proxyTrans, this.smoothVectors[0], this.smoothVectors[1], this.smoothVectors[2], this.smoothVectors[3], this.percent);
          perc = proxyTrans[0];
        }
        else{perc = this.percent;}

        //Apply animations if enabled
        this.cachedTrans.copy(this.deltaTrans);
        if(flags&ANIM_POS){
          vec3.lerp(this.deltaTrans.position, this.initTrans.position, this.destTrans.position, perc);
        }
        if(flags&ANIM_SCALE){
          vec3.lerp(this.deltaTrans.scale, this.initTrans.scale, this.destTrans.scale, perc);
        }
        if(flags&ANIM_ROT){
          quat.slerp(this.deltaTrans.rotation, this.initTrans.rotation, this.destTrans.rotation, perc);
        }
        this.cachedTrans.difference(this.deltaTrans);
        this.Object.transform.add(this.cachedTrans);
      }
    }
  }
  else if(flags&INT_BEZ){
    this.update = function(){
      if(this.percent > 1.00){
        if(this.circular){
          this.percent = -1.00;
          this.upTick = false;
        }
        else if(this.bounce && this.upTick){
          this.direction = this.direction*-1;
          this.upTick = false;
        }
        else if ((this.loop || this.curCount < this.count)&&!this.bounce) {
          this.percent = this.percent%1.00;
          this.curCount++;
        }
        else if (!this.bounce){
          this.finished = true;
        }
      }
      else if (this.percent < -1.00) {
        if(this.circular){
          this.percent = 1.00;
          this.upTick = false;
        }
        else{
          this.finished = true;
        }
      }
      else if ((!this.reversed && !this.upTick && this.percent > 0.00)||(this.reversed && !this.upTick && this.percent < 0.00)) {
        if(this.loop || this.curCount<this.count){
          this.upTick = true;
          this.curCount++;
        }
        else {
          this.finished = true;
        }
      }
      else if(this.percent < 0.00){
        if(this.circular){
          //do nothing since we want to go to -1.00
        }
        else if(this.loop && this.bounce && !this.uptick){
          this.direction = this.direction*-1;
          this.percent = 0.00001;
          this.curCount++;
          this.upTick = true;
        }
        else if (this.loop || this.curCount < this.count) {
          this.percent = 1.00;
          this.curCount++;
        }
        else{
          this.finished = true;
        }
      }
      if(this.curCount == this.count && !this.loop){
        this.finished = true;
      }
      if(!this.finished){
        //Compute percent done
        var addPercent = (this.speed*(Engine.TimeKeeper.deltaTime/1000))/100;
        this.percent += this.direction * addPercent;

        var perc = null;
        if(this.smoothed){
          var proxyTrans = vec3.create();
          vec3.bezier(proxyTrans, this.smoothVectors[0], this.smoothVectors[1], this.smoothVectors[2], this.smoothVectors[3], this.percent);
          perc = proxyTrans[0];
        }
        else{perc = this.percent;}
        //Apply animations if enabled
        this.cachedTrans.copy(this.deltaTrans);
        if(flags&ANIM_POS){
          vec3.bezier(this.deltaTrans.position, this.initTrans.position, this.destTrans[0].position, this.destTrans[1].position, this.destTrans[2].position, perc);
        }
        if(flags&ANIM_SCALE){
          vec3.bezier(this.deltaTrans.scale, this.initTrans.scale, this.destTrans[0].scale, this.destTrans[1].scale, this.destTrans[2].scale, perc);
        }
        if(flags&ANIM_ROT){
          quat.slerp(this.deltaTrans.rotation, this.initTrans.rotation, this.destTrans[2].rotation, perc);
        }
        this.cachedTrans.difference(this.deltaTrans);
        this.Object.transform.add(this.cachedTrans);
      }
    }
  }
  else if(flags&INT_HERM){
    this.update = function(){
      if(this.percent > 1.00){
        if(this.circular){
          this.percent = -1.00;
          this.upTick = false;
        }
        else if(this.bounce && this.upTick){
          this.direction = this.direction*-1;
          this.upTick = false;
        }
        else if ((this.loop || this.curCount < this.count)&&!this.bounce) {
          this.percent = this.percent%1.00;
          this.curCount++;
        }
        else if (!this.bounce){
          this.finished = true;
        }
      }
      else if (this.percent < -1.00) {
        if(this.circular){
          this.percent = 1.00;
          this.upTick = false;
        }
        else{
          this.finished = true;
        }
      }
      else if ((!this.reversed && !this.upTick && this.percent > 0.00)||(this.reversed && !this.upTick && this.percent < 0.00)) {
        if(this.loop || this.curCount<this.count){
          this.upTick = true;
          this.curCount++;
        }
        else {
          this.finished = true;
        }
      }
      else if(this.percent < 0.00){
        if(this.circular){
          //do nothing since we want to go to -1.00
        }
        else if(this.loop && this.bounce && !this.uptick){
          this.direction = this.direction*-1;
          this.percent = 0.00001;
          this.curCount++;
          this.upTick = true;
        }
        else if (this.loop || this.curCount < this.count) {
          this.percent = 1.00;
          this.curCount++;
        }
        else{
          this.finished = true;
        }
      }
      if(this.curCount == this.count && !this.loop){
        this.finished = true;
      }
      if(!this.finished){
        //Compute percent done
        var addPercent = (this.speed*(Engine.TimeKeeper.deltaTime/1000))/100;
        this.percent += this.direction * addPercent;

        var perc = null;
        if(this.smoothed){
          var proxyTrans = vec3.create();
          vec3.bezier(proxyTrans, this.smoothVectors[0], this.smoothVectors[1], this.smoothVectors[2], this.smoothVectors[3], this.percent);
          perc = proxyTrans[0];
        }
        else{perc = this.percent;}
        //Apply animations if enabled
        this.cachedTrans.copy(this.deltaTrans);
        if(flags&ANIM_POS){
          vec3.hermite(this.deltaTrans.position, this.initTrans.position, this.destTrans[0].position, this.destTrans[1].position, this.destTrans[2].position, perc);
        }
        if(flags&ANIM_SCALE){
          vec3.hermite(this.deltaTrans.scale, this.initTrans.scale, this.destTrans[0].scale, this.destTrans[1].scale, this.destTrans[2].scale, perc);
        }
        if(flags&ANIM_ROT){
          quat.slerp(this.deltaTrans.rotation, this.initTrans.rotation, this.destTrans[2].rotation, perc);
        }
        this.cachedTrans.difference(this.deltaTrans);
        this.Object.transform.add(this.cachedTrans);
      }
    }
  }
  else{
    console.log("No valid animation flag provided.");
  }
}
