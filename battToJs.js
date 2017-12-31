var commands=null;
var c=null;
var code=null;
var temp=null;
var insideString=null;
var endWaits=null;
var endRepeats=null;
var dictionary=null;

const fs = require('fs');
function removeBattTag(command){
  if(command.indexOf("=")==-1){
    return "";
  }
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
  if(command==undefined){
    return null;
  }
  var index=command.indexOf("=");
  if(index==-1){
    index=command.length
  }
  var result=command.substring(0,index);
  if(result!=result.toUpperCase()){
    result=false;
  }
  //console.log(result,getGenericTag(result));
  return getGenericTag(result);
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
  if(getBattTag(c[c.length-2])=="GET"||
    getBattTag(c[c.length-2])=="SET"){
    index--;
  }
  switch(getBattTag(c[index])){
    case "CLICK":
      action=".click()"
      break;
    case "SET":
      var noTag=removeBattTag(c[index]).split(":");
      switch(getGenericTag(noTag[0])){
        case "ATTR":
          var tags=removeBattTag(c[index]).split(",");
          action=".setAttribute('"+tags[0]+"','"+tags[1]+"');";
          break;
        case "VALUE":
          action=".value='"+noTag[1]+"'";
          break;
        case "TEXT":
          action=".textContent='"+noTag[1]+"'";
          break;
        case "HTML":
          action=".innerHTML='"+noTag[1]+"'";
          break;
      }
      break;
    case "GET":
      var noTag=removeBattTag(c[index]).split(":");
      preaction="storage['battStorage']['"+removeBattTag(c[index+1])+"']=";
      switch(getGenericTag(noTag[0])){
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

function findLogicalOperator(condition){
  var logicalOperators = [
    "===",
    "!==",
    "==",
    "!=",
    ">=",
    "<=",
    ">",
    "<"
  ];
  for(var o=0;o<logicalOperators.length;o++){
    if(condition.indexOf(logicalOperators[o])!=-1){
      return logicalOperators[o];
    }
  }
  return null;
}

function findBitwiseOperator(separator){
  var bitwiseOperators = {
    "NOT":"!",
    "OR":"|",
    "AND":"&",
    "XOR":"^",
    //"NOT":"~",
    "<<":"<<",
    ">>":">>",
    ">>>":">>>"
  };
  if(bitwiseOperators[separator]!=undefined){
    return bitwiseOperators[separator];
  } else {
    return null;
  }
}

function translationHandler(c){
  var code="";
  switch(getBattTag(c[0])){
    case "FUNCTION":
      //FUNCTION NAME PARAMS="asd,asd,sdf"
      code+='function '+c[1]+'('+removeBattTag(c[2])+'){'
      break;
    case "IF":
    case "WHILE":
      code+=getBattTag(c[0]).toLowerCase()+'('
      var co="";
      for(var ci=1;ci<c.length;ci++){
        co=c[ci].trim();
        var separator=findBitwiseOperator(co);
        if(separator != null){
          code+=separator;
        } else {
          control=findLogicalOperator(co);
          conditions=co.split(control);
          code+=conditions[0]+control+conditions[1];
        }
      }
      code+='){';
      break;
    case "FOR":
      //FOR I=0 TO I=100 STEPS=1
      var variableName=c[1].split("=")[0];
      code+="for( var "+c[1]+";"+variableName+"<="+parseInt(c[3].split("=")[1])+";"+variableName+"+="+parseInt(c[4].split("=")[1])+"){";
      break;
    case "FOREACH":
      //FOREACH ELEMENT IN ELEMENTS
      code+="for( var "+c[1]+" in "+c[3]+"){";
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
    case "EXECUTE":
      switch(getBattTag(c[1])){
        case "CODE":
          code+=removeBattTag(c[1]);
          break;
        case "FUNCTION":
          var params="";
          if(c.length>=3){
              params=removeBattTag(c[2]);
          }
          code+=removeBattTag(c[1])+"("+params+");";
          break;
      }
      break;
    case "WAIT":
      code+="setTimeout(function(){";
      endWaits.push((parseFloat(c[1])*1000));
      break;
    case "REPEAT":
      code+="setInterval(function(){";
      endRepeats.push((parseFloat(c[1])*1000));
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
        case "REPEAT":
          code+="},"+endRepeats.pop()+");";
          break;
        case "IF":
        case "FOR":
        case "WHILE":
        case "SWITCH":
        case "FUNCTION":
        case "FOREACH":
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




function replaceBattTag(command,tag){
  var index=command.indexOf("=");
  var separator="=";
  if(index==-1){
    separator="";
  }
  var result=tag+separator+removeBattTag(command);
  return result;
}


function getGenericTag(tag){
  for(var key in dictionary){
    if(dictionary[key].indexOf(tag)!=-1){
      return key;
    }
  }
  return null;
}

function translationToGenericLanguage(c){
  console.log(c);
  var newC=c;
  var tag=null;
  try{
    for(var i=0;i<newC.length;i++){
      genericTag=getGenericTag(getBattTag(newC[i]));
      if(genericTag==null){
        throw "Tag not found "+newC[i];
      }
      newC[i]=replaceBattTag(newC[i],genericTag);
    }
  } catch(e){
    console.log(e);
  }
  console.log(newC);
  console.log("=");
  return newC;
}

function translateBattFile(path){
  fs.readFile(path, 'utf8', function (err, data) {
    if (err) throw err;
    commands=data.split("\n");
    code="exports.init = function(batt){\nvar o=window;\nvar doc=window.document;\nvar storage=batt.getConfig();\n";
    temp="";
    insideString=false;
    endWaits=[];
    endRepeats=[];
    for(var i=0;i<commands.length;i++){
      c=separateCommandLine(commands[i]);
      //c=translationToGenericLanguage(c);
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

function init(path){
  commands=null;
  c=null;
  code=null;
  temp=null;
  insideString=null;
  endWaits=null;
  endRepeats=null;
  translateBattFile(path);
}

function loadDictionary(language,callback){
  var localesPath = __dirname+"/locales/";
  fs.readFile(localesPath+language+".json", 'utf8', function (err, data) {
    if (err) throw err;
    dictionary=JSON.parse(data);
    callback();
  });
}

exports.translateBattFile=function(path){
  if(dictionary==null){
    require(__dirname+"/windowCreator.js").readConfig(__dirname+'\\GUI\\',function(config){
      loadDictionary(config.language,function(){
        init(path);
      });
    },false);
  } else {
    init(path);
  }
}
