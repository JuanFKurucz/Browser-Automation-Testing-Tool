var commands=null;
var c=null;
var code=null;
var temp=null;
var insideString=null;
var endWaits=null;
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
function separateCommandLine(commandline){
  a=commandline.trim();
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
  return c;
}

function elementsAction(c){
  var action="";
  var preaction="";
  var index=c.length-1;
  if(getBattTag(c[c.length-2])=="GET"){
    index--;
  }
  switch(getBattTag(c[index])){
    case "CLICK":
      action=".click()"
      break;
    case "VALUE":
      action=".value='"+removeBattTag(c[index])+"'";
      break;
    case "TEXT":
      action=".textContent='"+removeBattTag(c[index])+"'";
      break;
    case "HTML":
      action=".innerHTML='"+removeBattTag(c[index])+"'";
      break;
    case "SETATTR":
      var tags=removeBattTag(c[index]).split(",");
      action=".setAttribute('"+tags[0]+"','"+tags[1]+"');";
      break;
    case "GET":
      var noTag=removeBattTag(c[index]).split(":");
      preaction="storage['battStorage']['"+removeBattTag(c[index+1])+"']=";
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
  return [preaction,action];
}

function translationHandler(c){
  var code="";
  switch(c[0]){
    case "IF":
      var conditions;
      var control;
      if(c[1].indexOf("===")!=-1){
        conditions=c[1].split("===");
        control="===";
      } else if(c[1].indexOf("==")!=-1){
        conditions=c[1].split("==");
        control="==";
      }
      code+='if('+conditions[0]+control+conditions[1]+'){';
      break;
    case "SEARCH":
      code+='batt.waitForElements(o,["'+removeBattTag(c[1]).split(',').join('","')+'"]';
      if(c.length>=3){
        code+=','+removeBattTag(c[2]);
      }
      if(c.length>=4){
        code+=','+(parseFloat(removeBattTag(c[3]))*1000);
      }
      code+=',function(o,doc,elements){';
      break;
    case "ELEMENT":
    case "ELEMENTS":
      var actpre=elementsAction(c);
      if(getBattTag(c[1])!=="POS" || c[0] == "ELEMENT"){
        code+=actpre[0]+"elements[0]";
      } else {
        code+=actpre[0]+"elements["+removeBattTag(c[1])+"]";
      }
      code+=actpre[1]+"\n";
      if(getBattTag(c[c.length-1])=="GET"){
        code+='batt.saveConfig(storage);';
      }
      break;
    case "FIND":
      var actpre=elementsAction(c);
      if(getBattTag(c[2])=="POS"){
        code+=actpre[0]+"doc.querySelectorAll('"+removeBattTag(c[1])+"')["+parseInt(removeBattTag(c[2]))+"]";
      } else {
        code+=actpre[0]+"doc.querySelector('"+removeBattTag(c[1])+"')";
      }
      code+=actpre[1]+"\n";
      if(getBattTag(c[c.length-2])=="GET"){
        code+='batt.saveConfig(storage);';
      }
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
        case "SEARCH":
        //case "CONTROLDOCUMENT":
          code+="});";
          break;
        case "WAIT":
          code+="},"+endWaits.pop()+");";
          break;
        case "IF":
          code+="}"
          break;
      }
  }
  return code;
}
function variablesHandler(code){
  var obj={
    localVars:{
      start:"[[",
      rstart:/\[\[/g,
      rend:/\]\]/g,
      end:"]]",
      newStart:"'+storage['battStorage']['",
      newEnd:"']+'"
    },
    globalVars:{
      start:"{{",
      rstart:/{{/g,
      rend:/}}/g,
      end:"}}",
      newStart:"",
      newEnd:""
    }
  };
  var codeLines=code.split("\n");
  for(var cl=0;cl<codeLines.length;cl++){
    for(key in obj){
      if(codeLines[cl].includes(obj[key].start)&&codeLines[cl].includes(obj[key].end)){
        codeLines[cl]=codeLines[cl].replace(obj[key].rstart,obj[key].newStart);
        codeLines[cl]=codeLines[cl].replace(obj[key].rend,obj[key].newEnd);
      }
    }
  }
  return codeLines.join("\n");
}
function translateBattFile(path){
  fs.readFile(path, 'utf8', function (err, data) {
    if (err) throw err;
    commands=data.split("\n");
    c=null;
    code="exports.init = function(batt){\nvar o=window;\nvar doc=window.document;\nvar storage=batt.getConfig();\n";
    temp="";
    insideString=false;
    endWaits=[];
    for(var i=0;i<commands.length;i++){
      c=separateCommandLine(commands[i]);
      code+=translationHandler(c)+"\n";
    }
    code+="}";
    code=variablesHandler(code);
    writeTranslatedFile(path,code);
  });
}
function writeTranslatedFile(path,code){
  fs.writeFile(path.replace(".batt","-translated.js"),code, function(err) {
      if(err) {
          return console.log(err);
      }
  });
}

exports.translateBattFile=function(path){
  translateBattFile(path);
}
