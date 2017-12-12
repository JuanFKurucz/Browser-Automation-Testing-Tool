console.log('hola');
const fs = require('fs');
const {noSpace} = require("../transformName.js");
const Folder = './Projects/';

function createDOMProject(path,name,cont){
  var container,type;
  if(cont==null){
    container = document.getElementsByClassName("folders")[0];
    type="div"
  } else {
    container=cont;
    type="li";
  }
  var newDiv = document.createElement(type);
  newDiv.setAttribute("class",noSpace(name));
  container.appendChild(newDiv);

  var newSpan = document.createElement("span");
  newSpan.textContent=name;
  newSpan.setAttribute("class","title");
  newSpan.onclick=function(){
    if(this.children[0].textContent=="⇧"){
      this.children[0].textContent="⇩";
      this.parentElement.children[1].style.display="none";
    } else {
      this.children[0].textContent="⇧";
      this.parentElement.children[1].style.display="";
    }
  }
  newDiv.appendChild(newSpan);
  var childSpan = document.createElement("span");
  childSpan.setAttribute("class","folderShow");
  childSpan.textContent="⇧";
  newSpan.appendChild(childSpan);

  var newList = document.createElement("ul");
  newList.setAttribute("class","list files");
  newDiv.appendChild(newList);

  searchInsideFolder(path+name+"/",function(file,data){
    if(data!=undefined&&data.isDirectory()){
      createDOMProject(path+name+"/",file,newList);
    } else {
      createDOMFile(file,newList);
    }
  })
}

function createDOMFile(name,parent){
  if(parent==null){
    console.log('die');
  } else {
    var newLi = document.createElement("li");
    newLi.textContent = name;
    parent.appendChild(newLi);
  }
}

function searchInsideFolder(Folder,callback){
  fs.readdir(Folder, (err, files) => {
    console.log(Folder,files)
    files.forEach(file => {
      fs.stat(Folder+file,function(err,data){
        callback(file,data);
      });
    });
  });
}

function searchProjects(){
  searchInsideFolder(Folder,function(file,data){
    if(data.isDirectory()){
      createDOMProject(Folder,file,null);
    } else {
      createDOMFile(file,null);
    }
  })
}

document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    searchProjects();
  }
}
