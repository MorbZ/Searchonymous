'use strict';

let assert = require('assert');
let searchonymous = require('../src/background.js');

describe('Whitelist Cookie', () => {
	let tests = [
		/*[
			Name,
			Whitelist,
			Input cookies,
			Expected output cookies,
		],*/
		[
			'Empty whitelist',
			[],
			'CONSENT=WP.276asd; 1P_JAR=2019-2-17-20; NID=160=ZFBK',
			'',
		],
		[
			'Empty string',
			['NID', 'CONSENT'],
			'',
			'',
		],
		[
			'Only NID and CONSENT',
			['NID', 'CONSENT'],
			'CONSENT=WP.276asd; 1P_JAR=2019-2-17-20; NID=160=ZFBK',
			'CONSENT=WP.276asd; NID=160=ZFBK',
		],
		[
			'Semicolon',
			['COOK1', 'COOK2', 'asd'],
			'COOK1=hello; COOK2=worl;d; asd=dsa',
			'COOK1=hello; COOK2=worl;d; asd=dsa',
		],
		[
			'Same name',
			['COOK'],
			'COOK=hello; COOK=worl;d; COOK=dsa',
			'COOK=hello; COOK=worl;d; COOK=dsa',
		],
	];
	for(let test of tests) {
		it(test[0], () => {
			assert.equal(searchonymous.getWhitelistedCookies(test[2], test[1]), test[3]);
		});
	}
});
