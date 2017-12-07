const {app} = require("electron");
const windowCreator = require(__dirname+"/windowCreator.js");


function init(){
	var data={
		title:"Example window",
		width:800,
		height:600,
		script:__dirname+'/script.js'
	};
	let window = windowCreator.create(data);
	window.loadURL("http://www.google.com/");
}

app.on('ready', function(){
	init();
})
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', function () {
  if (mainWindow === null) {
		init();
  }
})
