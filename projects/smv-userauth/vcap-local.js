var fs = require('fs'),
	jsonData = fs.readFileSync("vcap-local.json", "utf-8"),
	vcapServices = JSON.parse(jsonData);

console.log(JSON.stringify(vcapServices));

