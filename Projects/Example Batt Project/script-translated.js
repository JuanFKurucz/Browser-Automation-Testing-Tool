exports.init = function(batt){
var o=window;
var doc=window.document;
var storage=batt.getConfig();
batt.waitForElements(o,["input[type=\'text'\]","input[type=\'submit\']"],function(o,doc,elements){
elements[0].value='Example project';

elements[1].click();

});

}