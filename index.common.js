'use strict'

var metadata = require('./metadata.min')
var custom = require('./custom')

exports = module.exports = {}

var context = { metadata: metadata }

exports.parse  = custom.parse.bind(context)
exports.format = custom.format.bind(context)

exports.is_valid_number = custom.is_valid_number.bind(context)
exports.isValidNumber   = exports.is_valid_number

exports.as_you_type = custom.as_you_type(metadata)
exports.asYouType   = exports.as_you_type

// exports['default'] = ...