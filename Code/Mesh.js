//==============================================================================
//3D Object Class
//Contains buffer locations of mesh data for a given object as well as othe r
//usefull information
//Properties:
//
//==============================================================================
function Mesh(name, shader = "Unlit"){
  this.Buffer = {"position":null,
                 "normal":null,
                 "uv":null,
                 "Index":null};
  this.Textures = {};
  this.tag = name;
  this.type = 'obj';
  this.transform = new Transform();
  this.Shader = shader;
  this.initialized = false;
}
//==============================================================================
//set uniforms and draw settings
//==============================================================================
Mesh.prototype.draw = function(){
  setUni(this.Shader, this);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);
  gl.depthMask(true);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,  this.Buffer.Index);
  gl.drawElements(gl.TRIANGLES, this.Buffer.Index.numVerts, gl.UNSIGNED_SHORT, 0);
}
//==============================================================================
//Loads mesh data form server
//==============================================================================
Mesh.prototype.load = function(){
  var Addr = "Resources/Models/"+this.tag+".json";
  var AddrTex = "Resources/Textures/"+this.tag+"_diffuse.png";
  console.log("Requesting: "+Addr);
  LoadMesh(Addr, this);
  console.log("Requesting: "+AddrTex);
  LoadTex(AddrTex, "Diffuse", this);
}
//==============================================================================
//Request mesh data from server
//==============================================================================
function LoadMesh(Addr, obj){
  download(Addr)
  .then((mesh)=>{
    console.groupCollapsed("Receiving Mesh...");
    console.log("Loading model: "+ Addr);
    BindMesh(JSON.parse(mesh), obj);
  })
  .catch((err)=>{console.log(err);});
}
//==============================================================================
//Do things with loaded mesh data
//==============================================================================
function BindMesh(Mesh, obj){
  console.log("Binding positions...");
  obj.Buffer.position = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.Buffer.position);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Mesh.data.attributes.position.array), gl.STATIC_DRAW);
  obj.Buffer.position.itemSize = Mesh.data.attributes.position.itemSize;
  obj.Buffer.position.numItems = Mesh.data.attributes.position.array.length;
  console.log("Binding normals...");
  obj.Buffer.normal = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.Buffer.normal);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Mesh.data.attributes.normal.array), gl.STATIC_DRAW);
  obj.Buffer.normal.itemSize = Mesh.data.attributes.normal.itemSize;
  console.log("Binding UVs...");
  obj.Buffer.uv = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.Buffer.uv);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Mesh.data.attributes.uv.array), gl.STATIC_DRAW);
  obj.Buffer.uv.itemSize = Mesh.data.attributes.uv.itemSize;
  console.log("Binding indicies...");
  obj.Buffer.Index = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.Buffer.Index);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(Mesh.data.index.array), gl.STATIC_DRAW);
  obj.Buffer.Index.numVerts = Mesh.data.index.array.length;
  console.log("Mesh initialized.");
  obj.initialized = true;
  console.groupEnd();
}
