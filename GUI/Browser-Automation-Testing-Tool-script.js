document.onreadystatechange = function () {
if (document.readyState == 'complete') {
var globalProject=require('C:\\Users\\usuario\\Documents\\GitHub\\Browser-Automation-Testing-Tool\\Projects\\global.js');
require('C:\\Users\\usuario\\Documents\\GitHub\\Browser-Automation-Testing-Tool\\GUI\\\\src\\script.js').init(globalProject);
}
}