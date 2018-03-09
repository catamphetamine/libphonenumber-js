'use strict'

// Not everyone needs `findNumbers()` function,
// so to reduce application bundle size
// it has been moved to a separate file.

exports = module.exports = {}

var PhoneNumberMatcher = require('./build/PhoneNumberMatcher').default
var Leniency = require('./build/PhoneNumberMatcher').Leniency

exports.Leniency = Leniency

exports['default'] = function findNumbers(text, defaultCountry, leniency, maxTries)
{
	leniency = leniency || Leniency.VALID
	maxTries = maxTries || Number.MAX_SAFE_INTEGER

	// Must return some kind of an iterator.
	// Maybe a stream (async), or an array (sync).
	// See `hasNext()` and `next()` methods of `PhoneNumberMatcher`.
	return new PhoneNumberMatcher(text, defaultRegion, leniency, maxTries)

	// Example:
	//
	// for (const number of findNumbers(text, 'US')) {
	// 	console.log(number)
	// }
}