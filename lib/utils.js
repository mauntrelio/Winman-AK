
exports.sanitize = function(string) {
	return string.replace(/ +/g,"_").replace(/'/g,"");
}

