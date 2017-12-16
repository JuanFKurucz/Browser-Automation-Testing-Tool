function init(){
  document.write("Script is working");
}

document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    init();
  }
}
  
