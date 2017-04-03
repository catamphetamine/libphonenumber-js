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

exports.get_number_type = function get_number_type()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.getNumberType.apply(this, parameters)
}

exports.is_valid_number = function is_valid_number()
{
	var parameters = Array.prototype.slice.call(arguments)
	parameters.push(metadata)
	return custom.isValidNumber.apply(this, parameters)
}

exports.as_you_type = function as_you_type(country)
{
	custom.asYouType.call(this, country, metadata)
}

exports.as_you_type.prototype = Object.create(custom.asYouType.prototype, {})
exports.as_you_type.prototype.constructor = exports.as_you_type

exports.DIGIT_PLACEHOLDER = custom.DIGIT_PLACEHOLDER

// camelCase aliases
exports.getNumberType = exports.get_number_type
exports.isValidNumber = exports.is_valid_number
exports.asYouType = exports.as_you_type

exports.getPhoneCode = function(country)
{
	return custom.getPhoneCode(country, metadata)
}