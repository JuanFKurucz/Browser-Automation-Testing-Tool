const {BrowserWindow} = require("electron");
const {noSpace} = require("./transformName.js");

const fs = require('fs');

function removeBattTag(command){
  var result=command.substring(command.indexOf("=")+1,command.length);
  if(result[0]==='"'||result[0]==="'"){
    result=result.substring(1,result.length);
  }
  if(result[result.length-1]==='"'||result[result.length-1]==="'"){
    result=result.substring(0,result.length-1);
  }
  return result;
}

function getBattTag(command){
  var index=command.indexOf("=");
  if(index==-1){
    index=command.length
  }
  var result=command.substring(0,index);
  if(result!=result.toUpperCase()){
    result=false;
  }
  return result;
}

function translateBattFile(path){
  fs.readFile(path, 'utf8', function (err, data) {
    if (err) throw err;
    var commands=data.split("\n");
    var c=null;
    var code="exports.init = function(batt){\nvar o=window;\nvar doc=window.document;\nvar storage=batt.getConfig();\n";
    var temp="";
    var insideString=false;
    var endWaits=[];
    for(var i=0;i<commands.length;i++){
      a=commands[i].trim();
      c=[];
      for(var l=0;l<a.length;l++){
        if(insideString==false && a[l]==" "){
          c.push(temp);
          temp="";
        } else {
          temp+=a[l];
          if(a[l]=='"'){
            if(insideString==false){
              insideString=true;
            } else {
              insideString=false;
            }
          }
        }
      }
      if(temp!=""){
        c.push(temp);
        temp="";
      }
      switch(c[0]){
        case "WAITFOR":
          code+='batt.waitForElements(o,["'+removeBattTag(c[1]).split(',').join('","')+'"]';
          if(c.length>=3){
            code+=','+removeBattTag(c[2]);
          }
          if(c.length>=4){
            code+=','+(parseFloat(removeBattTag(c[3]))*1000);
          }
          code+=',function(o,doc){';
          break;
        case "FIND":
          var index=0;
          if(getBattTag(c[2])!="POS"){
            index=-1;
          }
          var action="";
          var preaction="";
          switch(getBattTag(c[3+index])){
            case "CLICK":
              action=".click()"
              break;
            case "VALUE":
              action=".value='"+removeBattTag(c[3+index])+"'";
              break;
            case "TEXT":
              action=".textContent='"+removeBattTag(c[3+index])+"'";
              break;
            case "HTML":
              action=".innerHTML='"+removeBattTag(c[3+index])+"'";
              break;
            case "SETATTR":
              var tags=removeBattTag(c[3+index]).split(",");
              action=".setAttribute('"+tags[0]+"','"+tags[1]+"');";
              break;
            case "GET":
              var noTag=removeBattTag(c[3+index]).split(":");
              preaction="storage['battStorage']['"+removeBattTag(c[4+index])+"']=";
              switch(noTag[0]){
                case "ATTR":
                  action=".getAttribute('"+noTag[1]+"')";
                  break;
                case "VALUE":
                  action=".value";
                  break;
                case "TEXT":
                  action=".textContent";
                  break;
                case "HTML":
                  action=".innerHTML";
                  break;
              }
              break;
          }
          action+=";";

          if(getBattTag(c[2])=="POS"){
            code+=preaction+"doc.querySelectorAll('"+removeBattTag(c[1])+"')["+parseInt(removeBattTag(c[2]))+"]";
          } else {
            code+=preaction+"doc.querySelector('"+removeBattTag(c[1])+"')";
          }
          code+=action+"\n";
          code+='batt.saveConfig(storage);';
          break;
        case "EXEC":
          code+=removeBattTag(c[1]);
          break;
        case "WAIT":
          code+="setTimeout(function(){";
          endWaits.push((parseFloat(c[1])*1000));
          break;
        case "CLOSE":
          code+="window.close();";
          break;
        case "GO":
          code+="window.location.href='"+removeBattTag(c[1])+"';"
          break;
        case "STORAGE":
          var variableData=removeBattTag(c[1]);
          switch(getBattTag(c[1])){
            case "SET":
              code+="storage['battStorage']['"+removeBattTag(c[1]).split(":")[0]+"']='"+removeBattTag(c[1]).split(":")[1]+"';\n";
              break;
            case "CLEAN":
              code+="delete storage['battStorage']['"+removeBattTag(c[1])+"'];\n";
              break;
          }
          code+'batt.saveConfig(storage);';
          break;
        case "END":
          switch(getBattTag(c[1])){
            case "WAITFOR":
            //case "CONTROLDOCUMENT":
              code+="});";
              break;
            case "WAIT":
              code+="},"+endWaits.pop()+");";
              break;
          }
      }
      code+="\n";
    }
    code+="}";
    var codeLines=code.split("\n");
    for(var cl=0;cl<codeLines.length;cl++){
      if(codeLines[cl].includes("[[")&&codeLines[cl].includes("]]")){
        codeLines[cl]=codeLines[cl].replace(/\[\[/g,"'+storage['battStorage']['");
        codeLines[cl]=codeLines[cl].replace(/\]\]/g,"']+'");
      }
    }
    code=codeLines.join("\n");
    fs.writeFile(path.replace(".batt","-translated.js"),code, function(err) {
        if(err) {
            return console.log(err);
        }
    });
  });
}

function generateScriptFile(data,callback){
  if(data.window.title !== undefined&&data.scripts !== undefined&&data.window.folder !== undefined){
    var text="document.onreadystatechange = function () {\nif (document.readyState == '"+data.runat+"') {\n";
    text+="var globalProject=require('"+__dirname.replace(/\\/g,"\\\\")+"\\\\Projects\\\\global.js');\n"
    var folderR=data.window.folder.replace(/\\/g,"\\\\");
    var dots=null;
    var scripts=null;
    if(typeof data.scripts =="string"){
      scripts=[data.scripts];
    } else {
      scripts=data.scripts;
    }
    for(var i=0;i<scripts.length;i++){
      dots=scripts[i].split(".");
      if(dots[dots.length-1]==="batt"){
        translateBattFile(folderR+"\\\\"+scripts[i].replace(/\//g,"\\\\"));
        text+="require('"+folderR+"\\\\"+scripts[i].replace(/\//g,"\\\\").replace(".batt","-translated.js")+"').init(globalProject);\n";
      } else if(dots[dots.length-1]==="js"){
        text+="require('"+folderR+"\\\\"+scripts[i].replace(/\//g,"\\\\")+"').init(globalProject);\n";
      }
    }
    text+="}\n}";
    fs.writeFile(data.window.folder+"\\"+noSpace(data.window.title)+"-script.js",text, function(err) {
        if(err) {
            return console.log(err);
        }
        callback();
    });
  }
}

function readConfig(folderPath,callback){
  fs.readFile(folderPath+"\\config.json", 'utf8', function (err, data) {
    if (err) throw err;
    var obj=JSON.parse(data);
    obj.window.folder = folderPath;
    if(!("battStorage" in obj)){
      obj.battStorage={};
    }
    obj.window.webPreferences.preload=folderPath+"\\"+noSpace(obj.window.title)+"-script.js";
    return callback(obj);
  });
}

function ValidURL(str) {
  //https://stackoverflow.com/a/30229098
  var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  if(!regex .test(str)) {
    return false;
  } else {
    return true;
  }
}

function createWindow(data){
  let window = new BrowserWindow(data.window);

  window.getConfig=data;

  if(data.url!=undefined){
    if(ValidURL(data.url)){
      window.loadURL(data.url);
    } else {
      window.loadURL(data.window.folder+"\\"+data.url);
    }
  }
  window.on('closed', () => {
    var configData=window.getConfig;
    fs.writeFile(configData.window.folder+"\\config.json",JSON.stringify(configData),function(){
      window=null;
    });
  })

  if(data.main!=undefined){
    require(data.window.folder+"\\"+data.main).init(window);
  }
  return window;
}
exports.create=function(project,callback=null){
  readConfig(project,function(data){
    generateScriptFile(data,function(){
      var window=createWindow(data);
      if(callback!=null){
        callback(window);
      }
    });
  });
}
