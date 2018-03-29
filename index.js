const fs = require('fs');

const blackholeIP = '0.0.0.0';
const domainIPSeparator = '\t';

function domainSort(a, b) {
	for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
		if (!b[i] || a[i] > b[i]) {
			return 1;
		} else if (!a[i] || a[i] < b[i]) {
			return -1;
		}
	}

	return 0;
}

fs.readFile('hosts', function (e, hosts) {
	if (e) {
		console.error(e);
		return process.exit(1);
	}

	const lines = hosts.toString().split('\n')

	const seen = {};
	const special = [];

	for (let i = 0; i < lines.length; i += 1) {
		if (lines[i].substring(0, 7) === blackholeIP) {
			seen[lines[i]] = true
		} else {
			special.push(lines[i]);
		}
	}

	const domains = Object.keys(seen).map(function (line) {
		const domain = line.split(domainIPSeparator)[1] || '';
		return domain.split('.').reverse();
	});

	domains.sort(domainSort);

	const output = special.join('\n') + '\n' + domains.map(function (domain) {
		return blackholeIP + domainIPSeparator + domain.reverse().join('.');
	}).join('\n') + '\n';

	fs.writeFile('hosts-dedupe', output, function (e) {
		if (e) {
			console.error(e);
			return process.exit(1);
		}
	});
});
