//==============================================================================
//ANIMPLAYER OBJECT
//Maintains information about the currently active animations
//==============================================================================
function AnimPlayer(){
  this.Animations = [];
  this.update = function(){
    for(var i = 0; i < this.Animations.length; i++){
      if(!this.Animations[i].isRunning){
        
      }
    }
  }
}
//==============================================================================
//ANIMATION OBJECT
//Maintains information about and object and its current animation
//==============================================================================
function Animation(){
  this.Object = null;
  this.function = null;
  this.isRunning = true;
  this.loop = true;
}
