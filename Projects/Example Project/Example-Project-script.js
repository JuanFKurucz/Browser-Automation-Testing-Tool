document.onreadystatechange = function () {
if (document.readyState == 'complete') {
var globalProject=require('E:\\GitHub\\Browser-Automation-Testing-Tool\\Projects\\global.js');
require('E:\\GitHub\\Browser-Automation-Testing-Tool\\Projects\\Example Project\\script.js').init(globalProject);
}
}