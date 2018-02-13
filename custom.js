'use strict'

exports = module.exports = {}

exports.parse             = require('./build/parse').default
exports.DIGITS            = require('./build/common').DIGIT_MAPPINGS
exports.format            = require('./build/format').default
exports.getNumberType     = require('./build/types').default
exports.isValidNumber     = require('./build/validate').default
exports.AsYouType         = require('./build/AsYouType').default
exports.DIGIT_PLACEHOLDER = require('./build/AsYouType').DIGIT_PLACEHOLDER

var Metadata = require('./build/metadata').default

exports.getCountryCallingCode = function(country, metadata)
{
	metadata = new Metadata(metadata)

	if (!metadata.hasCountry(country))
	{
		throw new Error('Unknown country: ' + country)
	}

	return metadata.country(country).countryCallingCode()
}

// `getPhoneCode` name is deprecated, use `getCountryCallingCode` instead.
exports.getPhoneCode = exports.getCountryCallingCode

exports.parseRFC3966 = require('./build/RFC3966').parseRFC3966
exports.formatRFC3966 = require('./build/RFC3966').formatRFC3966

exports.Metadata = require('./build/metadata').default

// exports['default'] = ...