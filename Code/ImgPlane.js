//==============================================================================
//Image Plane Function
//Creates geometry given an image
//==============================================================================
function ImgPlane(texture, scale = 1){
  this.Buffer = {};
  this.Buffer.position = gl.createBuffer();
  this.Buffer.normal = gl.createBuffer();
  this.Buffer.uv = gl.createBuffer();
  this.Textures = {};
  var scale = 2/canvas.height*scale;
  this.transform = new Transform(undefined, vec3.fromValues(scale, scale, 1), undefined);
  this.Shader = 'Unlit';
  this.type = 'img';
  this.numVerts = 6;
  this.parent = null;
  LoadNPOTTex(("Resources/Textures/"+texture+".png"), 'diffuse', this);
}
ImgPlane.prototype.build = function(){
  var pos = new Float32Array(this.numVerts*3);
  //var norm = new Float32Array(this.numVerts*3);
  var uv = new Float32Array(this.numVerts*2);

  pos[0] = 0;
  pos[1] = 0;
  pos[2] = 0;
  uv[0] = 0;
  uv[1] = 0;
  pos[3] = this.Textures.diffuse.width;
  pos[4] = 0;
  pos[5] = 0;
  uv[2] = 1;
  uv[3] = 0;

  pos[6] = 0;
  pos[7] = this.Textures.diffuse.height;
  pos[8] = 0;
  uv[4] = 0;
  uv[5] = 1;

  pos[9] = 0;
  pos[10] = this.Textures.diffuse.height;
  pos[11] = 0;
  uv[6] = 0;
  uv[7] = 1;

  pos[12] = this.Textures.diffuse.width;
  pos[13] = 0;
  pos[14] = 0;
  uv[8] = 1;
  uv[9] = 0;

  pos[15] = this.Textures.diffuse.width;
  pos[16] = this.Textures.diffuse.height;
  pos[17] = 0;
  uv[10] = 1;
  uv[11] = 1;

  console.log(pos);
  console.log(uv);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.Buffer.position);
  gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.Buffer.uv);
  gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
  this.initialized = true;
}
//==============================================================================
//set uniforms and draw settings
//==============================================================================
ImgPlane.prototype.draw = function(){
  setUni(this.Shader, this);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);
  gl.depthMask(true);
  gl.drawArrays(gl.TRIANGLES, 0, this.numVerts);
}
