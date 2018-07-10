const fs = require('fs');

const PATH_TO_HOSTS = '/mnt/c/Windows/System32/drivers/etc/hosts';

const BLACKHOLE_IP = '0.0.0.0';
const DOMAIN_IP_SEPARATOR = '\t';

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

function domainExplode(line) {
	const domain = line.split(DOMAIN_IP_SEPARATOR)[1] || '';
	return domain.split('.').reverse();
}

function domainCollapse(domain) {
	return BLACKHOLE_IP + DOMAIN_IP_SEPARATOR + domain.reverse().join('.');
}

fs.readFile(PATH_TO_HOSTS, function (e, hosts) {
	if (e) {
		console.error(e);
		return process.exit(1);
	}

	const lines = hosts.toString().split('\r\n');

	const seen = {};
	const special = [];

	lines.forEach(function (line) {
		if (line.substring(0, 7) === BLACKHOLE_IP) {
			seen[line] = true;
		} else if (line) {
			special.push(line);
		}
	});

	// Let's add one blank line between the comment section and the domains
	special.push('');

	const domains = Object.keys(seen).map(domainExplode);

	domains.sort(domainSort);

	const output = special.concat(domains.map(domainCollapse)).join('\n') + '\n';

	fs.writeFile('hosts', output, function (e) {
		if (e) {
			console.error(e);
			return process.exit(1);
		}
	});
});
