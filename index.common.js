'use strict'

var custom   = require('./custom')
var metadata = require('./metadata.min.json')

exports = module.exports = {}

// Deprecated: remove `parse()` export in 2.0.0.
// (renamed to `parseNumber()`)
exports.parse = function parse()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.parseNumber.apply(this, parameters)
}

exports.parseNumber = function parseNumber()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.parseNumber.apply(this, parameters)
}

// Deprecated: remove `format()` export in 2.0.0.
// (renamed to `formatNumber()`)
exports.format = function format()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.formatNumber.apply(this, parameters)
}

exports.formatNumber = function formatNumber()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.formatNumber.apply(this, parameters)
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

exports.isValidNumberForRegion = function isValidNumberForRegion()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.isValidNumberForRegion.apply(this, parameters)
}

exports.findPhoneNumbers = function findPhoneNumbers()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.findPhoneNumbers.apply(this, parameters)
}

exports.searchPhoneNumbers = function searchPhoneNumbers()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.searchPhoneNumbers.apply(this, parameters)
}

exports.PhoneNumberSearch = function PhoneNumberSearch(text, options)
{
	custom.PhoneNumberSearch.call(this, text, options, metadata)
}

exports.PhoneNumberSearch.prototype = Object.create(custom.PhoneNumberSearch.prototype, {})
exports.PhoneNumberSearch.prototype.constructor = exports.PhoneNumberSearch

exports.AsYouType = function AsYouType(country)
{
	custom.AsYouType.call(this, country, metadata)
}

exports.AsYouType.prototype = Object.create(custom.AsYouType.prototype, {})
exports.AsYouType.prototype.constructor = exports.AsYouType

exports.getExtPrefix = function()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.getExtPrefix.apply(this, parameters)
}

exports.parseRFC3966 = function()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.parseRFC3966.apply(this, parameters)
}

exports.formatRFC3966 = function()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.formatRFC3966.apply(this, parameters)
}

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
