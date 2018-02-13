import metadata from './metadata.min.json'

import parseCustom from './es6/parse'
import getNumberTypeCustom from './es6/types'
import formatCustom from './es6/format'
import isValidNumberCustom from './es6/validate'
import AsYouTypeCustom from './es6/AsYouType'

import Metadata from './es6/metadata'
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

export { default as formatCustom }        from './es6/format'
export { default as isValidNumberCustom } from './es6/validate'
export { default as getNumberTypeCustom } from './es6/types'

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

export function getCountryCallingCodeCustom(country, metadata)
{
	metadata = new Metadata(metadata)

	if (!metadata.hasCountry(country))
	{
		throw new Error('Unknown country: ' + country)
	}

	return metadata.country(country).countryCallingCode()
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