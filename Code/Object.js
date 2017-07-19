//==============================================================================
//3D Object Class
//Contains buffer locations of mesh data for a given object as well as other
//usefull information
//Properties:
//
//==============================================================================
function Object(name, gl){
  this.Buffer = {};
  this.Buffer.position = null;
  this.Buffer.normal = null;
  this.Buffer.uv = null;
  this.Buffer.Index = null;
  this.transform = new Transform();
  this.initialized = false;
  var Addr = "Resources/Models/"+name+".json";
  LoadMesh(Addr, gl, this);
}
//==============================================================================
//Request mesh data from server
//==============================================================================
function LoadMesh(Addr, gl, obj){
  var req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      BindMesh(JSON.parse(req.responseText), gl, obj);
    }
  };
  req.open("GET", Addr, false);
  req.send();
}
//==============================================================================
//Do things with loaded mesh data
//==============================================================================
function BindMesh(Mesh, gl, obj){
  console.log("Binding positions...");
  obj.Buffer.position = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.Buffer.position);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Mesh.data.attributes.position.array), gl.STATIC_DRAW);
  obj.Buffer.position.itemSize = Mesh.data.attributes.position.itemSize;
  console.log("Binding normals...");
  obj.Buffer.normal = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.Buffer.position);
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
  obj.initialized = true;
}
