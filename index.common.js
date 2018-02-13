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

// `DIGIT_PLACEHOLDER` is used by `react-phone-number-input`.
exports.DIGIT_PLACEHOLDER = custom.DIGIT_PLACEHOLDER
// `DIGITS` are used by `react-phone-number-input`.
exports.DIGITS = custom.DIGITS

exports.getCountryCallingCode = function(country)
{
	return custom.getCountryCallingCode(country, metadata)
}

// `getPhoneCode` name is deprecated
exports.getPhoneCode = exports.getCountryCallingCode
