'use strict'

var metadata = require('../metadata.mobile.json')
var core = require('../core/index.commonjs')

function call(func, _arguments) {
	var args = Array.prototype.slice.call(_arguments)
	args.push(metadata)
	return func.apply(this, args)
}

exports = module.exports = {}

exports.ParseError = core.ParseError

exports.parsePhoneNumber = function parsePhoneNumber() {
	return call(core.parsePhoneNumber, arguments)
}

exports.parsePhoneNumberFromString = function parsePhoneNumberFromString() {
	return call(core.parsePhoneNumberFromString, arguments)
}

exports.findNumbers = function findNumbers() {
	return call(core.findNumbers, arguments)
}

exports.searchNumbers = function searchNumbers() {
	return call(core.searchNumbers, arguments)
}

exports.PhoneNumberMatcher = function PhoneNumberMatcher(text, options) {
	return core.PhoneNumberMatcher.call(this, text, options, metadata)
}
exports.PhoneNumberMatcher.prototype = Object.create(core.PhoneNumberMatcher.prototype, {})
exports.PhoneNumberMatcher.prototype.constructor = exports.PhoneNumberMatcher

exports.AsYouType = function AsYouType(country) {
	return core.AsYouType.call(this, country, metadata)
}
exports.AsYouType.prototype = Object.create(core.AsYouType.prototype, {})
exports.AsYouType.prototype.constructor = exports.AsYouType

exports.isSupportedCountry = function isSupportedCountry(country) {
	return call(core.isSupportedCountry, arguments)
}

exports.getCountryCallingCode = function getCountryCallingCode() {
	return call(core.getCountryCallingCode, arguments)
}

exports.getExtPrefix = function getExtPrefix(country) {
	return call(core.getExtPrefix, arguments)
}

exports.getExampleNumber = function getExampleNumber() {
	return call(core.getExampleNumber, arguments)
}

exports.formatIncompletePhoneNumber = function formatIncompletePhoneNumber() {
	return call(core.formatIncompletePhoneNumber, arguments)
}

exports.parseIncompletePhoneNumber = core.parseIncompletePhoneNumber
exports.parsePhoneNumberCharacter = core.parsePhoneNumberCharacter
exports.parseDigits = core.parseDigits

exports.parseRFC3966 = core.parseRFC3966
exports.formatRFC3966 = core.formatRFC3966