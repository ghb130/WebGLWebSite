//==============================================================================
//CAMERA OBJECT
//Holds position and rotation data for a camera as well as supporting methods
//Similar to a stripped down Object
//==============================================================================
function Camera(index){
  this.transform = new Transform();
  this.forwardVec = vec3.fromValues(0,0,-1);
  this.upVec = vec3.fromValues(0,1,0);
  this.fov = 70;
  this.nearClip = 0.1;
  this.farClip = 100;
  this.index = index;
  this.setView = function(){
    mat4.perspective(Engine.Matrices.MVPMatrix, this.fov, gl.viewportWidth/gl.viewportHeight, this.nearClip, this.farClip);
    mat4.lookAt(Engine.Matrices.TempMatrix, this.transform.position, this.forwardVec, this.upVec);
    mat4.multiply(Engine.Matrices.MVPMatrix, Engine.Matrices.MVPMatrix, Engine.Matrices.TempMatrix);
  }
}
