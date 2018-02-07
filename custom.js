'use strict'

exports = module.exports = {}

exports.parse             = require('./build/parse').default
exports.DIGITS            = require('./build/common').DIGIT_MAPPINGS
exports.format            = require('./build/format').default
exports.getNumberType     = require('./build/types').default
exports.isValidNumber     = require('./build/validate').default
exports.AsYouType         = require('./build/AsYouType').default
exports.DIGIT_PLACEHOLDER = require('./build/AsYouType').DIGIT_PLACEHOLDER

var get_country_calling_code = require('./build/metadata').get_country_calling_code

exports.getCountryCallingCode = function(country, metadata)
{
	if (!metadata.countries[country])
	{
		throw new Error('Unknown country: "' + country + '"')
	}

	return get_country_calling_code(metadata.countries[country])
}

// `getPhoneCode` name is deprecated, use `getCountryCallingCode` instead.
exports.getPhoneCode = exports.getCountryCallingCode

// exports['default'] = ...