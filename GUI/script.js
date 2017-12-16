const fs = require('fs');
const {noSpace} = require("../transformName.js");
const Folder = './Projects/';
const {ipcRenderer} = require('electron')

function init(){
  document.querySelector("#startButton").onclick=function(){
    ipcRenderer.send('createWindow', "\\Projects\\"+this.getAttribute("project"))
  }
}

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
  newSpan.onclick=function(){
    //Set info to buttons
    document.querySelector("#startButton").setAttribute("project",name);
    document.querySelector("#stopButton").setAttribute("project",name);
    document.querySelector("#projecTitle").textContent=name;
  }
  newSpan.setAttribute("class","title");

  newDiv.appendChild(newSpan);
  var childSpan = document.createElement("span");
  childSpan.setAttribute("class","folderShow");
  childSpan.textContent="⇧";
  childSpan.onclick=function(){
    if(this.textContent=="⇧"){
      this.textContent="⇩";
      this.parentElement.children[2].style.display="none";
    } else {
      this.textContent="⇧";
      this.parentElement.children[2].style.display="";
    }
  }
  newDiv.appendChild(childSpan);

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

var path = require('path');
var projectsDir = path.dirname(require.main.filename).replace("GUI","Projects");
function createDOMFile(name,parent){
  if(parent==null){
    console.log('die');
  } else {
    var newLi = document.createElement("li");
    newLi.textContent = name;
    newLi.onclick=function(){
      fs.readFile(projectsDir+"\\"+parent.parentElement.querySelector(".title").textContent+"\\"+name, function read(err, data) {
        if (err) {
            throw err;
        }
        document.querySelector("#codeEditor").textContent=data;
    });

    }
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
    init();
    searchProjects();
  }
}
