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

  this.build = function(){
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
  LoadNPOTTex(("Resources/Textures/"+texture+".png"), 'diffuse', this);
}
//==============================================================================
//Request NPOT texture data from server for img plane
//==============================================================================
function LoadNPOTTex(Addr, type, obj){
  obj.Textures[type] = gl.createTexture();
  //Create a temporary 1x1 pixel texture until real texture is loaded
  gl.bindTexture(gl.TEXTURE_2D, obj.Textures[type]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([30, 30, 30, 255]));
  var image = new Image();
  image.src = Addr;
  image.addEventListener('load', function(){
    console.groupCollapsed("Receiving Texture...");
    console.log("Loading Texture: "+Addr);
    obj.Textures[type].width = image.width;
    obj.Textures[type].height = image.height;
    console.log(image.width+" px by "+image.height+" px");
    gl.bindTexture(gl.TEXTURE_2D, obj.Textures[type]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameterf(gl.TEXTURE_2D, Engine.Extensions.aniso.TEXTURE_MAX_ANISOTROPY_EXT, 4);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    obj.build();
    console.groupEnd();
  });
}
