var window=require('electron').remote.getCurrentWindow();
function getProjectConfig(){
  console.log(window.getConfig);
  return window.getConfig;
}
function saveProjectConfig(config){
  window.getConfig=config;
}

function findElement(doc,query,pos){
  return doc.querySelectorAll(query)[pos];
}

function controlReadyState(parentDoc,at,callback){
  var doc;
  if(parentDoc.contentWindow == undefined){
    doc=parentDoc.document;
  } else {
    doc=parentDoc.contentWindow.document;
  }
  console.log(doc,doc.readyState,at);
  if(doc.readyState==at){
    callback();
  } else {
    doc.onreadystatechange = function () {
      if (doc.readyState == at) {
        callback();
      }
    }
  }
}

exports.getConfig=function(){
  return getProjectConfig();
}
exports.saveConfig=function(config){
  saveProjectConfig(config);
}
exports.waitForElements=function(){
  var objects=[];
  var parentDoc = arguments[0];
  var querys = arguments[1];
  var cancel = null;
  var timer = null;
  if(arguments.length>=4){
    cancel = arguments[2];
  }
  if(arguments.length>=5){
    timer = arguments[3];
  }
  var callback=arguments[arguments.length-1];
  if(timer==null||timer==undefined){
    timer=1000;
  }
  if(cancel==null||cancel==undefined){
    cancel=true;
  }
  var doc;

  if(cancel){
    try{
      clearInterval(waiting);
    }catch(e){}
  }
  console.log("querys: "+querys);
  var working=true;
  var i=0;
	let waiting=setInterval(function(){
    objects=[];
    if(parentDoc.document != undefined){
      doc=parentDoc.document;
    } else {
      doc=parentDoc.contentWindow.document;
    }
		working=true;
    if(typeof querys == "string"){
      console.log(doc,doc.querySelector(querys),querys);
      if(doc.querySelector(querys)==undefined){
        working=false;
      }
    } else {
  		for(i=0;i<querys.length;i++){
        console.log(doc,doc.querySelector(querys[i]),querys[i]);
  			if(doc.querySelectorAll(querys[i])==undefined){
  				working=false;
  				break;
  			} else{
          if(doc.querySelector(querys[i]).tagName=="IMG"){
            if(!doc.querySelector(querys[i]).complete){
              working=false;
      				break;
            } else {
              objects.push(doc.querySelector(querys[i]));
            }
          } else if(doc.querySelector(querys[i]).tagName=="IFRAME"){
            if(doc.querySelector(querys[i]).contentWindow.document.readyState!="complete"){
              working=false;
      				break;
            } else {
              parentDoc=doc.querySelector(querys[i]);
              objects.push(doc.querySelector(querys[i]));
            }
          } else {
            objects.push(doc.querySelector(querys[i]));
          }
        }
  		}
    }
		if(working){
      if(cancel){
        clearInterval(waiting);
      }
      var what=null;
      if(parentDoc.document != undefined){
        what=parentDoc.document;
      } else {
        what=parentDoc.contentWindow.document;
      }
			callback(parentDoc,what,objects);
		}
	},timer);
}
exports.controlDocumentReadyState=function(doc,at,callback){
  controlReadyState(doc,at,callback);
}
exports.findElement=function(doc,query,pos=0){
  return findElement(doc,query,pos)
}
