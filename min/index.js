// Importing from `.json.js` a workaround for a bug in web browsers' "native"
// ES6 importing system which is uncapable of importing "*.json" files.
// https://github.com/catamphetamine/libphonenumber-js/issues/239
import metadata from '../metadata.min.json.js'

import {
	parsePhoneNumber as _parsePhoneNumber,
	parsePhoneNumberFromString as _parsePhoneNumberFromString,

	findNumbers as _findNumbers,
	searchNumbers as _searchNumbers,
	findPhoneNumbersInText as _findPhoneNumbersInText,
	searchPhoneNumbersInText as _searchPhoneNumbersInText,
	PhoneNumberMatcher as _PhoneNumberMatcher,

	AsYouType as _AsYouType,

	isSupportedCountry as _isSupportedCountry,
	getCountries as _getCountries,
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

export function findPhoneNumbersInText() {
	return call(_findPhoneNumbersInText, arguments)
}

export function searchPhoneNumbersInText() {
	return call(_searchPhoneNumbersInText, arguments)
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

export function getCountries() {
	return call(_getCountries, arguments)
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