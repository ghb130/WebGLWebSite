//==============================================================================
//3D Object Class
//Contains buffer locations of mesh data for a given object as well as othe r
//usefull information
//Properties:
//
//==============================================================================
function Object(name, shader = "Unlit"){
  this.Buffer = {};
  this.Buffer.position = null;
  this.Buffer.normal = null;
  this.Buffer.uv = null;
  this.Buffer.Index = null;
  this.Textures = {};
  this.tag = name;
  this.type = 'obj';
  this.transform = new Transform();
  this.Shader = shader;
  this.instances = 0;
  this.parent = null;
  this.initialized = false;
  var Addr = "Resources/Models/"+name+".json";
  var AddrTex = "Resources/Textures/"+name+"_diffuse.png";
  console.log("Requesting: "+Addr);
  LoadMesh(Addr, this);
  console.log("Requesting: "+AddrTex);
  LoadTex(AddrTex, "diffuse", this);
}
//==============================================================================
//Object Intance function. Dont need to reload resources when we instance.
//==============================================================================
function ObjInst(name, shader = "Unlit"){
  this.Buffer = {};
  this.Buffer.position = null;
  this.Buffer.normal = null;
  this.Buffer.uv = null;
  this.Buffer.Index = null;
  this.Textures = {};
  this.tag = name;
  this.type = 'obj';
  this.transform = new Transform();
  this.Shader = shader;
  this.initialized = false;
}
//==============================================================================
//Request mesh data from server
//==============================================================================
function LoadMesh(Addr, obj){
  var req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      console.groupCollapsed("Receiving Mesh...");
      console.log("Loading model: "+req.responseURL);
      BindMesh(JSON.parse(req.responseText), obj);
    }
  };
  req.open("GET", Addr, true);
  req.send();
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
