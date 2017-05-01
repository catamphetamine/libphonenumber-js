'use strict'

exports = module.exports = {}

exports.parse             = require('./build/parse').default
exports.format            = require('./build/format').default
exports.get_number_type   = require('./build/get number type').default
exports.is_valid_number   = require('./build/validate').default
exports.as_you_type       = require('./build/as you type').default
exports.DIGIT_PLACEHOLDER = require('./build/as you type').DIGIT_PLACEHOLDER

// camelCase aliases
exports.getNumberType = exports.get_number_type
exports.isValidNumber = exports.is_valid_number
exports.asYouType     = exports.as_you_type

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