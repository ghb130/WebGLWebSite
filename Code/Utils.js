function Load(Addr, Callback){
  var req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      Callback(this);
    }
  };
  req.open("GET", Addr, true);
  req.send();
}

function LogReq(req){
  console.log(req.responseText);
}
