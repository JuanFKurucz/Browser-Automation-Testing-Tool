document.onreadystatechange = function () {
if (document.readyState == 'complete') {
var globalProject=require('E:\\GitHub\\Browser-Automation-Testing-Tool\\Projects\\global.js');
require('E:\\GitHub\\Browser-Automation-Testing-Tool\\Projects\\Example Batt Project\\script-translated.js').init(globalProject);
}
}