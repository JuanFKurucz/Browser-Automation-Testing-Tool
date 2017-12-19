function init(globalProject){
  var config = globalProject.getConfig();
  document.write("Script is working");
  if(config["done"]){
    config["done"]++;
  } else {
    config["done"]=1;
  }

  globalProject.saveConfig(config);
}

exports.init = function(globalProject){
  init(globalProject);
}
