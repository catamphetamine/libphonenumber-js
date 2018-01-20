'use strict'

var custom   = require('./custom')
var metadata = require('./metadata.min.json')

exports = module.exports = {}

exports.parse = function parse()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.parse.apply(this, parameters)
}

exports.format = function format()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.format.apply(this, parameters)
}

exports.getNumberType = function getNumberType()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.getNumberType.apply(this, parameters)
}

exports.isValidNumber = function isValidNumber()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.isValidNumber.apply(this, parameters)
}

exports.AsYouType = function AsYouType(country)
{
	custom.AsYouType.call(this, country, metadata)
}

exports.AsYouType.prototype = Object.create(custom.AsYouType.prototype, {})
exports.AsYouType.prototype.constructor = exports.AsYouType

exports.DIGIT_PLACEHOLDER = custom.DIGIT_PLACEHOLDER
exports.DIGITS            = custom.DIGITS

// camelCase aliases
// `get_number_type` name is deprecated
exports.get_number_type = exports.getNumberType
// `is_valid_number` name is deprecated
exports.is_valid_number = exports.isValidNumber
// `as_you_type` name is deprecated
exports.as_you_type = exports.AsYouType
// `asYouType` name is deprecated
exports.asYouType = exports.AsYouType

exports.getPhoneCode = function(country)
{
	return custom.getPhoneCode(country, metadata)
}