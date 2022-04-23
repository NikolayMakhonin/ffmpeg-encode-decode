module.exports = {
	include     : [`{src,dist}/**/*.{js,ts}`],
	exclude     : [],
	reporter    : ['lcov'],
	'temp-dir'  : `./tmp/coverage/nyc/tmp`,
	'report-dir': `./tmp/coverage/nyc/lcov`,
}
