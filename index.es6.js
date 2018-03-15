import metadata from './metadata.min.json'

import parseCustom from './es6/parse'
import getNumberTypeCustom from './es6/types'
import formatCustom from './es6/format'
import isValidNumberCustom from './es6/validate'
import findPhoneNumbersCustom, { searchPhoneNumbers as searchPhoneNumbersCustom, PhoneNumberSearch as PhoneNumberSearchCustom } from './es6/findPhoneNumbers'
import AsYouTypeCustom from './es6/AsYouType'
import getCountryCallingCodeCustom from './es6/getCountryCallingCode'
export { default as Metadata } from './es6/metadata'
export { parseRFC3966, formatRFC3966 } from './es6/RFC3966'

export function parse()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return parseCustom.apply(this, parameters)
}

export function format()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return formatCustom.apply(this, parameters)
}

export function getNumberType()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return getNumberTypeCustom.apply(this, parameters)
}

export function isValidNumber()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return isValidNumberCustom.apply(this, parameters)
}

export function findPhoneNumbers()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return findPhoneNumbersCustom.apply(this, parameters)
}

export function searchPhoneNumbers()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return searchPhoneNumbersCustom.apply(this, parameters)
}

export function PhoneNumberSearch(text, options)
{
	PhoneNumberSearchCustom.call(this, text, options, metadata)
}

PhoneNumberSearch.prototype = Object.create(PhoneNumberSearchCustom.prototype, {})
PhoneNumberSearch.prototype.constructor = PhoneNumberSearch

export function AsYouType(country)
{
	AsYouTypeCustom.call(this, country, metadata)
}

AsYouType.prototype = Object.create(AsYouTypeCustom.prototype, {})
AsYouType.prototype.constructor = AsYouType

export
{
	default as parseCustom
}
from './es6/parse'

export
{
	// `DIGITS` are used by `react-phone-number-input`.
	DIGIT_MAPPINGS as DIGITS
}
from './es6/common'

// Deprecated: remove this in 2.0.0 and make `custom.js` in ES6
// (the old `custom.js` becomes `custom.commonjs.js`).
export { default as formatCustom }           from './es6/format'
export { default as isValidNumberCustom }    from './es6/validate'
export { default as findPhoneNumbersCustom } from './es6/findPhoneNumbers'
export { searchPhoneNumbers as searchPhoneNumbersCustom } from './es6/findPhoneNumbers'
export { PhoneNumberSearch as PhoneNumberSearchCustom } from './es6/findPhoneNumbers'
export { default as getNumberTypeCustom }    from './es6/types'
export { default as getCountryCallingCodeCustom } from './es6/getCountryCallingCode'

export
{
	default as AsYouTypeCustom,
	// `DIGIT_PLACEHOLDER` is used by `react-phone-number-input`.
	DIGIT_PLACEHOLDER
}
from './es6/AsYouType'

export function getCountryCallingCode(country)
{
	return getCountryCallingCodeCustom(country, metadata)
}

// `getPhoneCode` name is deprecated, use `getCountryCallingCode` instead.
export function getPhoneCode(country)
{
	return getCountryCallingCode(country)
}

// `getPhoneCodeCustom` name is deprecated, use `getCountryCallingCodeCustom` instead.
export function getPhoneCodeCustom(country, metadata)
{
	return getCountryCallingCodeCustom(country, metadata)
}