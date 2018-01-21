import metadata from './metadata.min.json'

import parseCustom from './es6/parse'
import getNumberTypeCustom from './es6/types'
import formatCustom from './es6/format'
import isValidNumberCustom from './es6/validate'
import AsYouTypeCustom from './es6/AsYouType'

import { get_phone_code } from './es6/metadata'

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

// `get_number_type` name is deprecated
export function get_number_type()
{
	return getNumberType.apply(this, arguments)
}

export function isValidNumber()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return isValidNumberCustom.apply(this, parameters)
}

// `is_valid_number` name is deprecated
export function is_valid_number()
{
	return isValidNumber.apply(this, arguments)
}

export function AsYouType(country)
{
	AsYouTypeCustom.call(this, country, metadata)
}

AsYouType.prototype = Object.create(AsYouTypeCustom.prototype, {})
AsYouType.prototype.constructor = AsYouType

// `as_you_type` name is deprecated
export function as_you_type(country)
{
	AsYouTypeCustom.call(this, country, metadata)
}

as_you_type.prototype = Object.create(AsYouTypeCustom.prototype, {})
as_you_type.prototype.constructor = as_you_type

// `asYouType` name is deprecated
export function asYouType(country)
{
	AsYouTypeCustom.call(this, country, metadata)
}

asYouType.prototype = Object.create(AsYouTypeCustom.prototype, {})
asYouType.prototype.constructor = asYouType

export
{
	default as parseCustom,
	DIGIT_MAPPINGS as DIGITS
}
from './es6/parse'

export { default as formatCustom }        from './es6/format'
export { default as isValidNumberCustom } from './es6/validate'
export { default as getNumberTypeCustom } from './es6/types'

export
{
	default as AsYouTypeCustom,
	// `asYouTypeCustom` name is deprecated
	default as asYouTypeCustom,
	DIGIT_PLACEHOLDER
}
from './es6/AsYouType'

export function getPhoneCode(country)
{
	return getPhoneCodeCustom(country, metadata)
}

export function getPhoneCodeCustom(country, metadata)
{
	if (!metadata.countries[country])
	{
		throw new Error('Unknown country: "' + country + '"')
	}

	return get_phone_code(metadata.countries[country])
}