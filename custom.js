'use strict'

exports = module.exports = {}

exports.parse             = require('./build/parse').default
exports.DIGITS            = require('./build/parse').DIGIT_MAPPINGS
exports.format            = require('./build/format').default
exports.getNumberType     = require('./build/types').default
exports.isValidNumber     = require('./build/validate').default
exports.AsYouType         = require('./build/AsYouType').default
exports.DIGIT_PLACEHOLDER = require('./build/AsYouType').DIGIT_PLACEHOLDER

var getPhoneCode = require('./build/metadata').get_phone_code

exports.getPhoneCode = function(country, metadata)
{
	if (!metadata.countries[country])
	{
		throw new Error('Unknown country: "' + country + '"')
	}

	return getPhoneCode(metadata.countries[country])
}

// exports['default'] = ...