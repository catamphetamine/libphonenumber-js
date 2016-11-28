'use strict'

exports = module.exports = {}

exports.parse = require('./build/parse').default
exports.format = require('./build/format').default

exports.is_valid_number = require('./build/validate')
exports.isValidNumber   = require('./build/validate')

exports.as_you_type = require('./build/as you type')
exports.asYouType   = require('./build/as you type')

// exports['default'] = ...