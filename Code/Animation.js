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
//object - object to apply the animation to
//trans - destination transform
//speed - animation playback speed, in % per second
//looping - boolean for whether to loop the animation.
//Flags:
var ANIM_PSR = 0b000000000111;
var ANIM_POS = 0b000000000001;
//0b00000000001 - animate position
var ANIM_SCALE =  0b000000000010;
//0b00000000010 - animate scale
var ANIM_ROT =    0b000000000100;
//0b00000000100 - animate rotation
var INT_LINE =    0b000000001000;
//0b00000001000 - linear interpolation
var INT_BEZ =     0b000000010000;
//0b00000010000 - bezier interpolation
var INT_HERM =    0b000000100000;
//0b00000100000 - hermite interpolation
var MULTI =       0b000001000000;
//0b00001000000 - multiple objects
var REPEAT =      0b000010000000;
//0b00010000000 - loop indefinitely
var BOUNCE =      0b000100000000;
//0b00100000000 - Reverse animation when it reaches the end
var CIRCULAR =    0b001000000000;
//0b00100000000 - similar to loop but will repeat starting at -1.0 percent
var REVERSED =    0b010000000000;
//0b01000000000 - reverses direction of motion
var COMPOUND =    0b100000000000;
//0b10000000000 - whether or not to reset the transform of the object at the end of the animation
//In the case that non linear interpolation is used, trans is expected to be an array of 3 transforms
//In the case that MULTI is true, object is expected to be an array of objects
//==============================================================================
function Animation(object, trans, speed, flags, count = 1){
  this.Object = object;
  this.destTrans = trans;
  this.initTrans = [];
  this.deltaTrans = new Transform();
  this.deltaTrans.copy(this.Object.transform);
  this.cachedTrans = new Transform();
  this.speed = speed;
  this.count = count;
  if(flags&REVERSED){this.direction = -1; this.reversed = true}
  else{this.direction = 1; this.reversed = false;}
  if(!(flags&CIRCULAR) && (flags&REVERSED)){this.curCount = -1;}
  else{this.curCount = 0;}
  this.compound = (flags&COMPOUND);
  this.circular = (flags&CIRCULAR);
  this.loop = (flags&REPEAT);
  this.bounce = (flags&BOUNCE);
  this.percent = 0.0;
  this.finished = false;
  this.upTick = true;
  //Cache initial transforms
  if(flags&MULTI){
    for(var i = 0; i < object.length; i++){
      this.initTrans.push(new Transform(object[i].transform.position, object[i].transform.scale, object[i].transform.rotation));
    }
  }
  else{
    this.initTrans = new Transform(object.transform.position, object.transform.scale, object.transform.rotation);
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
          //Apply animations if enabled
          this.cachedTrans.copy(this.deltaTrans);
          if(flags&ANIM_POS){
            vec3.lerp(this.deltaTrans.position, this.initTrans.position, this.destTrans.position, this.percent);
          }
          if(flags&ANIM_SCALE){
            vec3.lerp(this.deltaTrans.scale, this.initTrans.scale, this.destTrans.scale, this.percent);
          }
          if(flags&ANIM_ROT){
            quat.slerp(this.deltaTrans.rotation, this.initTrans.rotation, this.destTrans.rotation, this.percent);
          }
          this.cachedTrans.difference(this.deltaTrans);
          this.Object.transform.add(this.cachedTrans);
        }
      }
    }
    else if(flags&INT_BEZ){
      this.update = function(){

      }
    }
    else if(flags&INT_HERM){
      this.update = function(){

      }
    }
    else{
      console.log("No valid animation flag provided.");
    }
  }
}
