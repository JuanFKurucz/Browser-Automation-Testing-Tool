exports.init = function(batt){
var o=window;
var doc=window.document;
var storage=batt.getConfig();
batt.waitForElements(o,["input"],function(o,doc){
batt.findElement(doc,'input').value='Example project';
batt.saveConfig(storage);
batt.findElement(doc,'input',1).click();
batt.saveConfig(storage);
});

}