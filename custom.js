'use strict'

exports = module.exports = {}

exports.parse             = require('./build/parse').default
exports.DIGITS            = require('./build/parse').DIGIT_MAPPINGS
exports.format            = require('./build/format').default
exports.getNumberType     = require('./build/types').default
exports.isValidNumber     = require('./build/validate').default
exports.AsYouType         = require('./build/AsYouType').default
exports.DIGIT_PLACEHOLDER = require('./build/AsYouType').DIGIT_PLACEHOLDER

// `get_number_type` name is deprecated
exports.get_number_type = exports.getNumberType
// `is_valid_number` name is deprecated
exports.is_valid_number = exports.isValidNumber
// `as_you_type` name is deprecated
exports.as_you_type = exports.AsYouType
// `asYouType` name is deprecated
exports.asYouType = exports.AsYouType

var get_phone_code = require('./build/metadata').get_phone_code

exports.getPhoneCode = function(country, metadata)
{
	if (!metadata.countries[country])
	{
		throw new Error('Unknown country: "' + country + '"')
	}

	return get_phone_code(metadata.countries[country])
}

// exports['default'] = ...