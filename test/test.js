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

describe('Google search URL', () => {
	let tests = [
		/*[
			Name,
			URL,
			Is Google search URL,
		],*/
		[
			'Homepage',
			'https://www.google.com/',
			true,
		],
		[
			'Homepage',
			'https://video.google.com/webhp?asd',
			true,
		],
		[
			'Homepage False',
			'https://video.google.com/webhptest?asd',
			false,
		],
		[
			'Homepage',
			'http://google.com',
			true,
		],
		[
			'Search',
			'https://www.google.com/search?q=adads',
			true,
		],
		[
			'Search',
			'https://www.google.com/search/?q=adads',
			true,
		],
		[
			'Search False',
			'https://www.google.com/searchtest?q=adads',
			false,
		],
		[
			'Images Home',
			'https://images.google.com/',
			true,
		],
		[
			'Images Autocomplete',
			'https://images.google.com/complete/search?q=asd&psi=123',
			true,
		],
		[
			'Favicon',
			'https://www.google.com/favicon.ico',
			false,
		],
		[
			'Consent',
			'https://consent.google.com/status?continue=https://www.google.com&pc=s&timestamp=123&gl=DE',
			false,
		],
		[
			'Image',
			'https://encrypted-tbn0.gstatic.com/images?q=tbn:asd-asd',
			false,
		],
		[
			'Asset',
			'https://www.google.de/images/nav_logo242.png',
			false,
		],
		[
			'Preferences',
			'https://www.google.de/preferences?hl=de&prev=https://www.google.de/search?source',
			true,
		],
		[
			'Set Preferences',
			'https://www.google.com/setprefs?sig=123=&submit2=Save+Preferences&hl=en&lang=en&lr=lang_en&safeui=images&num=30',
			true,
		],
		[
			'Autocomplete',
			'https://www.google.at/complete/search?q&cp=0&client=psy-ab&xssi=t&gs_ri=gws-wiz&hl=de&authuser=0&psi=',
			true,
		],
		[
			'Autocomplete False',
			'https://www.google.at/completetest/testsearch?q',
			false,
		],
		[
			'Suggest Query',
			'https://suggestqueries.google.com/complete/search?client=books&ds=bo&q=dfs&callback=_callbacks',
			true,
		],
		[
			'Maps',
			'https://www.google.com/maps/vt/pb=!2!1',
			false,
		],
		[
			'Searchbox',
			'https://www.google.com/images/searchbox_sprites283_hr.webp',
			false,
		],
		[
			'News', // Carries Search parameter in POST
			'https://news.google.com/_/DotsSplashUi/data/batchexecute?rpcids=123&f.sid=123&bl=boq_dotssplashserver_20190208.02_p0&hl=en-US&gl=US&_reqid=123&rt=c',
			true,
		],
		[
			'Scholar',
			'https://scholar.google.com/scholar?hl=en&as_sdt=0,5&q=asd&btnG=',
			true,
		],
		[
			'Scholar Complete',
			'https://scholar.google.com.bd/scholar_complete?q=asd&hl=en&as_sdt=0,5&btnG=',
			true,
		],
		[
			'Scholar False',
			'https://scholar.google.de/gen_nid',
			false,
		],
		[
			'Account',
			'https://myaccount.google.com/?pli=1',
			false,
		],
		[
			'Mail',
			'https://mail.google.com/mail/u/2',
			false,
		],
		[
			'Youtube',
			'https://www.youtube.com/',
			false,
		],
		[
			'Webmaster Tools',
			'https://www.google.com/webmasters/tools/home?hl=de',
			false,
		],
		[
			'Webmaster Tools Search',
			'https://search.google.com/_/SearchConsoleAggReportUi/mutate?ds.extension=123&sid=123',
			false,
		],
		[
			'XHR Async irc',
			'https://www.google.com/async/irc?q=asdd&async=iu:0,_id:irc_async,_pms:s,_fmt:pc',
			true,
		],
		[
			'XHR Async bgasy',
			'https://www.google.com/async/bgasy?ei=abc&yv=3&async=_fmt:jspb',
			true,
		],
		[
			'XHR Async ecr',
			'https://www.google.com/async/ecr?ei=abc&lei=123&yv=3&async=encoded_cache_key:abc,version_info:123,attempt:1,_fmt:jspb',
			true,
		],
		[
			'XHR Async False',
			'https://www.google.com/async/test?123',
			false,
		],
		[
			'XHR gen_204',
			'https://www.google.com/gen_204?s=web&t=aft&atyp=csi&ei=abc',
			true,
		],
		[
			'XHR client_204',
			'https://www.google.com/client_204?&atyp=i&biw=123&bih=123&ei=abc',
			true,
		],
	];

	for(let test of tests) {
		it(test[0], () => {
			assert.equal(searchonymous.isSearchUrl(test[1]), test[2]);
		})
	};
});
