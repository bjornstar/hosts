var fs = require('fs');

fs.readFile('hosts', function (e, hosts) {
	if (e) {
		console.error(e);
		return process.exit(1);
	}

	var lines = hosts.toString().split('\n')

	var seen = {};

	for (var i = 0; i < lines.length; i += 1) {
		var line = lines[i];
		seen[line] = true
	}

	var output = Object.keys(seen).join('\n');

	fs.writeFile('hosts-dedupe', output, function (e) {
		if (e) {
			console.error(e);
			return process.exit(1);
		}
	});
});
