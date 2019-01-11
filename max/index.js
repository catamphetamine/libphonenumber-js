import metadata from '../metadata.full.json'

import {
	parsePhoneNumber as _parsePhoneNumber,
	parsePhoneNumberFromString as _parsePhoneNumberFromString,

	findNumbers as _findNumbers,
	searchNumbers as _searchNumbers,
	PhoneNumberMatcher as _PhoneNumberMatcher,

	AsYouType as _AsYouType,

	isSupportedCountry as _isSupportedCountry,
	getCountryCallingCode as _getCountryCallingCode,
	getExtPrefix as _getExtPrefix,

	getExampleNumber as _getExampleNumber,

	formatIncompletePhoneNumber as _formatIncompletePhoneNumber,
	parseIncompletePhoneNumber,
	parsePhoneNumberCharacter,
	parseDigits,

	parseRFC3966,
	formatRFC3966
} from '../core/index'

export {
	ParseError,

	parseIncompletePhoneNumber,
	parsePhoneNumberCharacter,
	parseDigits,

	parseRFC3966,
	formatRFC3966
} from '../core/index'

function call(func, _arguments) {
	var args = Array.prototype.slice.call(_arguments)
	args.push(metadata)
	return func.apply(this, args)
}

export function parsePhoneNumber() {
	return call(_parsePhoneNumber, arguments)
}

export function parsePhoneNumberFromString() {
	return call(_parsePhoneNumberFromString, arguments)
}

export function findNumbers() {
	return call(_findNumbers, arguments)
}

export function searchNumbers() {
	return call(_searchNumbers, arguments)
}

export function PhoneNumberMatcher(text, options) {
	return _PhoneNumberMatcher.call(this, text, options, metadata)
}
PhoneNumberMatcher.prototype = Object.create(_PhoneNumberMatcher.prototype, {})
PhoneNumberMatcher.prototype.constructor = PhoneNumberMatcher

export function AsYouType(country) {
	return _AsYouType.call(this, country, metadata)
}
AsYouType.prototype = Object.create(_AsYouType.prototype, {})
AsYouType.prototype.constructor = AsYouType

export function isSupportedCountry() {
	return call(_isSupportedCountry, arguments)
}

export function getCountryCallingCode() {
	return call(_getCountryCallingCode, arguments)
}

export function getExtPrefix(country) {
	return call(_getExtPrefix, arguments)
}

export function getExampleNumber() {
	return call(_getExampleNumber, arguments)
}

export function formatIncompletePhoneNumber() {
	return call(_formatIncompletePhoneNumber, arguments)
}