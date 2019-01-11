// Deprecated.
// Use `libphonenumber-js/min` or `libphonenumber-js/max` or `libphonenumber-js/core` instead.

'use strict'

var custom   = require('./custom')
var metadata = require('./metadata.min.json')

exports = module.exports = {}

exports.ParseError = custom.ParseError

exports.parsePhoneNumber = function parsePhoneNumber()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.parsePhoneNumber.apply(this, parameters)
}

exports.parsePhoneNumberFromString = function parsePhoneNumberFromString()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.parsePhoneNumberFromString.apply(this, parameters)
}
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

exports.getExampleNumber = function getExampleNumber()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.getExampleNumber.apply(this, parameters)
}

exports.isPossibleNumber = function isPossibleNumber()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.isPossibleNumber.apply(this, parameters)
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

// Deprecated.
exports.findPhoneNumbers = function findPhoneNumbers()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.findPhoneNumbers.apply(this, parameters)
}

// Deprecated.
exports.searchPhoneNumbers = function searchPhoneNumbers()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.searchPhoneNumbers.apply(this, parameters)
}

// Deprecated.
exports.PhoneNumberSearch = function PhoneNumberSearch(text, options)
{
	custom.PhoneNumberSearch.call(this, text, options, metadata)
}

// Deprecated.
exports.PhoneNumberSearch.prototype = Object.create(custom.PhoneNumberSearch.prototype, {})
exports.PhoneNumberSearch.prototype.constructor = exports.PhoneNumberSearch

exports.findNumbers = function findPhoneNumbers()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.findNumbers.apply(this, parameters)
}

exports.searchNumbers = function searchPhoneNumbers()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.searchNumbers.apply(this, parameters)
}

exports.PhoneNumberMatcher = function PhoneNumberMatcher(text, options)
{
	custom.PhoneNumberMatcher.call(this, text, options, metadata)
}

exports.PhoneNumberMatcher.prototype = Object.create(custom.PhoneNumberMatcher.prototype, {})
exports.PhoneNumberMatcher.prototype.constructor = exports.PhoneNumberMatcher

exports.AsYouType = function AsYouType(country)
{
	custom.AsYouType.call(this, country, metadata)
}

exports.AsYouType.prototype = Object.create(custom.AsYouType.prototype, {})
exports.AsYouType.prototype.constructor = exports.AsYouType

exports.isSupportedCountry = function()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.isSupportedCountry.apply(this, parameters)
}

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

// Deprecated: `DIGITS` were used by `react-phone-number-input`.
// Replaced by `parseDigits()`.
//
// Deprecated: `DIGIT_PLACEHOLDER` was used by `react-phone-number-input`.
// Not used anymore.
//
exports.DIGITS = custom.DIGITS
exports.DIGIT_PLACEHOLDER = custom.DIGIT_PLACEHOLDER

exports.getCountryCallingCode = function(country)
{
	return custom.getCountryCallingCode(country, metadata)
}

// `getPhoneCode` name is deprecated
exports.getPhoneCode = exports.getCountryCallingCode

exports.formatIncompletePhoneNumber = function()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.formatIncompletePhoneNumber.apply(this, parameters)
}

exports.parseIncompletePhoneNumber = custom.parseIncompletePhoneNumber
exports.parsePhoneNumberCharacter = custom.parsePhoneNumberCharacter
exports.parseDigits = custom.parseDigits