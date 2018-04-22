const fs = require('fs');

const PATH_TO_HOSTS = '/mnt/c/Windows/System32/drivers/etc/hosts';

const BLACKHOLE_IP = '0.0.0.0';
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

fs.readFile(PATH_TO_HOSTS, function (e, hosts) {
	if (e) {
		console.error(e);
		return process.exit(1);
	}

	const lines = hosts.toString().split('\r\n')

	const seen = {};
	const special = [];

	for (let i = 0; i < lines.length; i += 1) {
		if (lines[i].substring(0, 7) === BLACKHOLE_IP) {
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

	const output = special.join('\n') + domains.map(function (domain) {
		return BLACKHOLE_IP + domainIPSeparator + domain.reverse().join('.');
	}).join('\n') + '\n';

	fs.writeFile('hosts', output, function (e) {
		if (e) {
			console.error(e);
			return process.exit(1);
		}
	});
});
