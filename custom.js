'use strict'

exports = module.exports = {}

exports.parse             = require('./build/parse').default
exports.format            = require('./build/format').default
exports.get_number_type   = require('./build/parse').get_number_type
exports.is_valid_number   = require('./build/validate').default
exports.as_you_type       = require('./build/as you type').default
exports.DIGIT_PLACEHOLDER = require('./build/as you type').DIGIT_PLACEHOLDER

// camelCase aliases
exports.getNumberType = exports.get_number_type
exports.isValidNumber = exports.is_valid_number
exports.asYouType     = exports.as_you_type

// exports['default'] = ...