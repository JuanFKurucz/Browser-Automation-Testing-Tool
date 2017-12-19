const fs = require('fs');
const {noSpace} = require("../../transformName.js");
const Folder = './Projects/';
const {ipcRenderer} = require('electron')

function init(){
  document.querySelector("#startButton").onclick=function(){
    ipcRenderer.send('createWindow', "\\Projects\\"+this.getAttribute("project"))
  }
  document.querySelector("#MinimizeProgram").onclick=function(){
    ipcRenderer.send('MinimizeProgram')
  }
  document.querySelector("#CloseProgram").onclick=function(){
    ipcRenderer.send('CloseProgram')
  }
}


function createDOMProject(path,name,cont){
  var container,type,clase;
  if(cont==null){
    container = document.getElementsByClassName("folders")[0];
    type="div";
    clase="project";
  } else {
    container=cont;
    type="li";
    clase="folder"
  }
  var newDiv = document.createElement(type);
  newDiv.setAttribute("class",clase+" "+noSpace(name));
  container.appendChild(newDiv);




  var newSpan = document.createElement("span");
  newSpan.textContent=name;
  if(cont==null){
    newSpan.onclick=function(){
      //Set info to buttons
      document.querySelector("#startButton").setAttribute("project",name);
      document.querySelector("#stopButton").setAttribute("project",name);
      document.querySelector("#projecTitle").textContent=name;
    }
  }
  newSpan.setAttribute("class","title");

  newDiv.appendChild(newSpan);

  var newList = document.createElement("ul");
  newList.setAttribute("class","list files");
  newDiv.appendChild(newList);

  newDiv.addEventListener('click', function (e) {
    if (e.clientX < newSpan.getBoundingClientRect().left&&e.clientY < newSpan.getBoundingClientRect().bottom) {
      if(newList.style.display!="none"){
        newList.style.display="none";
      } else {
        newList.style.display="";
      }
    }
  });

  searchInsideFolder(path+name+"/",function(file,data){
    if(data!=undefined&&data.isDirectory()){
      createDOMProject(path+name+"/",file,newList);
    } else {
      createDOMFile(file,newList);
    }
  })
}

function createKeyRow(tr,text1=""){
  var td1= document.createElement("td");
  tr.appendChild(td1);

  var input1 = document.createElement("input");
  input1.type="text";
  input1.style="width:100%";
  input1.value=text1;
  td1.appendChild(input1);
}
function createTypeRow(tr,text1=""){
  var td1= document.createElement("td");
  tr.appendChild(td1);
  td1.style="width:75px;";
  var input1 = document.createElement("input");
  input1.type="text";
  input1.style="width:100%";
  input1.value=text1;
  td1.appendChild(input1);
}

function createDeleteRow(tr){
  var td3= document.createElement("td");
  tr.appendChild(td3);

  var input3 = document.createElement("input");
  input3.type="submit";
  input3.style="width:100%";
  input3.value="Delete";
  input3.onclick=function(){
    tr.parentElement.removeChild(tr);
  }
  td3.appendChild(input3);
}

function createNewRow(tr,text2=""){
  var td2= document.createElement("td");
  tr.appendChild(td2);
  var input2 = document.createElement("input");
  input2.type="text";
  input2.style="width:100%";
  input2.value=text2;
  td2.appendChild(input2);
}

function createNewTable(tr,key,obj){
  var newTr=document.createElement("tr");
  tr.parentElement.appendChild(newTr);

  var emptyTd=document.createElement("td");
  newTr.appendChild(emptyTd);

  var tableTD=document.createElement("td");
  tableTD.setAttribute("colspan","2");
  newTr.appendChild(tableTD);
  var smallTable= document.createElement("table");
  tableTD.appendChild(smallTable);


  var td2= document.createElement("td");
  tr.appendChild(td2);
  var inputAdd = document.createElement("input");
  inputAdd.type="submit";
  inputAdd.value="Add";
  inputAdd.style.width="100%";
  inputAdd.onclick=function(){
    var tr = document.createElement("tr");
    smallTable.appendChild(tr);
    createKeyRow(tr);
    createNewRow(tr);
    createDeleteRow(tr);
  }
  td2.appendChild(inputAdd);
  console.log(obj);
  createTableFromJson(smallTable,obj);
}

function createTableFromJson(table,obj){
  for(var key in obj){
    var tr = document.createElement("tr");
    table.appendChild(tr);
    createKeyRow(tr,key);
    if(obj[key]){
      createTypeRow(tr,Object.prototype.toString.call(obj[key]).replace("[object ","").replace("]",""))
    } else {
      createTypeRow(tr,"null")
    }
    if(obj[key]&&!(obj[key] instanceof Array)&&typeof obj[key]=="object"){
      createNewTable(tr,key,obj[key])
    } else {
      createNewRow(tr,obj[key])
    }
    createDeleteRow(tr);
  }
}

function visualizeJson(obj,path){
  document.querySelector("#codeEditor").style.display="none";
  document.querySelector("#jsonV").style.display="";
  document.querySelector("#jsonV").innerHTML="";

  var table = document.createElement("table");
  table.style.width="100%";
  document.querySelector("#jsonV").appendChild(table);

  var tr = document.createElement("tr");
  table.appendChild(tr);
  var title = document.createElement("th");
  title.textContent=path;
  title.style="text-align:center;font-size:21;"
  title.setAttribute("colspan","3");
  tr.appendChild(title);
  var tr = document.createElement("tr");
  table.appendChild(tr);
  var Add = document.createElement("th");
  Add.style="text-align:center;"
  Add.setAttribute("colspan","1");
  tr.appendChild(Add);

  var inputAdd = document.createElement("input");
  inputAdd.type="submit";
  inputAdd.value="Add new key";
  inputAdd.onclick=function(){
    var tr = document.createElement("tr");
    table.appendChild(tr);
    createKeyRow(tr);
    createNewRow(tr);
    createDeleteRow(tr);
  }
  Add.appendChild(inputAdd);

  var Save = document.createElement("th");
  Save.style="text-align:center;"
  Save.setAttribute("colspan","1");
  tr.appendChild(Save);

  var inputSave = document.createElement("input");
  inputSave.type="submit";
  inputSave.onclick=function(){
    saveToJson(table,path);
  }
  inputSave.value="Save config";
  Save.appendChild(inputSave);
  createTableFromJson(table,obj);
}

function saveToJson(table,path){
  var obj={};
  var input1Value,input2Value;
  var trs=table.getElementsByTagName("tr");
  for(var t=0;t<trs.length;t++){
    try{
      input1Value = trs[t].getElementsByTagName("td")[0].children[0].value;
      input2Value = trs[t].getElementsByTagName("td")[1].children[0].value;
      obj[input1Value]=input2Value;
    }catch(e){
      console.log(e);
      continue;
    }
  }
  var JSONo = JSON.stringify(obj);
  fs.writeFile(path,JSONo,'utf8',function(err) {
      if(err) {
          return console.log(err);
      }
  });
}

function fillTextArea(data){
  document.querySelector("#codeEditor").style.display="";
  document.querySelector("#jsonV").style.display="none";
  document.querySelector("#codeEditor").textContent=data;
}

var path = require('path');
var projectsDir = path.dirname(require.main.filename).replace("GUI","Projects");
function createDOMFile(name,parent){
  if(parent==null){
    console.log('die');
  } else {
    var newLi = document.createElement("li");

    newLi.setAttribute("class","file");
    newLi.onclick=function(){
      fs.readFile(projectsDir+"\\"+parent.parentElement.querySelector(".title").textContent+"\\"+name, function read(err, data) {
        if (err) {
            throw err;
        }
        if(!name.includes(".json")){
          fillTextArea(data);
        } else {
          try{
            var object = JSON.parse(data);
            visualizeJson(object,projectsDir+"\\"+parent.parentElement.querySelector(".title").textContent+"\\"+name);
          } catch(e){
            console.log(e);
            fillTextArea(data);
          }
        }
    });

    }
    parent.appendChild(newLi);
    newLi.textContent += name;
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
exports.init=function(){
  init();
  searchProjects();
}
