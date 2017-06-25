import metadata from './metadata.min.json'

import parseCustom from './es6/parse'
import getNumberTypeCustom from './es6/get number type'
import formatCustom from './es6/format'
import isValidNumberCustom from './es6/validate'
import asYouTypeCustom from './es6/as you type'

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

export function get_number_type()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return getNumberTypeCustom.apply(this, parameters)
}

// camelCase alias
export function getNumberType()
{
	return get_number_type.apply(this, arguments)
}

export function is_valid_number()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return isValidNumberCustom.apply(this, parameters)
}

// camelCase alias
export function isValidNumber()
{
	return is_valid_number.apply(this, arguments)
}

export function as_you_type(country)
{
	asYouTypeCustom.call(this, country, metadata)
}

as_you_type.prototype = Object.create(asYouTypeCustom.prototype, {})
as_you_type.prototype.constructor = as_you_type

// camelCase alias

export function asYouType(country)
{
	asYouTypeCustom.call(this, country, metadata)
}

asYouType.prototype = Object.create(asYouTypeCustom.prototype, {})
asYouType.prototype.constructor = asYouType

export { default as parseCustom }         from './es6/parse'
export { default as formatCustom }        from './es6/format'
export { default as isValidNumberCustom } from './es6/validate'
export { default as getNumberTypeCustom } from './es6/get number type'

export
{
	default as asYouTypeCustom,
	DIGIT_PLACEHOLDER
}
from './es6/as you type'

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