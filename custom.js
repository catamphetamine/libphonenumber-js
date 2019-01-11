// Deprecated.
// Use `libphonenumber-js/min` or `libphonenumber-js/max` or `libphonenumber-js/core` instead.

'use strict'

exports = module.exports = {}

exports.ParseError = require('./build/ParseError').default
exports.parsePhoneNumber = require('./build/parsePhoneNumber').default
exports.parsePhoneNumberFromString = require('./build/parsePhoneNumberFromString').default

// Deprecated: remove `parse()` export in 2.0.0.
// (renamed to `parseNumber()`)
exports.parse              = require('./build/parse').default
exports.parseNumber        = require('./build/parse').default
// Deprecated: remove `format()` export in 2.0.0.
// (renamed to `formatNumber()`)
exports.format             = require('./build/format').default
exports.formatNumber       = require('./build/format').default
exports.getNumberType      = require('./build/getNumberType').default
exports.getExampleNumber   = require('./build/getExampleNumber').default
exports.isPossibleNumber   = require('./build/isPossibleNumber').default
exports.isValidNumber      = require('./build/validate').default
exports.isValidNumberForRegion = require('./build/isValidNumberForRegion').default

exports.findNumbers        = require('./build/findNumbers').default
exports.searchNumbers      = require('./build/searchNumbers').default
exports.PhoneNumberMatcher = require('./build/PhoneNumberMatcher').default

// Deprecated.
exports.findPhoneNumbers   = require('./build/findPhoneNumbers').default
exports.searchPhoneNumbers = require('./build/findPhoneNumbers').searchPhoneNumbers
exports.PhoneNumberSearch  = require('./build/findPhoneNumbers_').PhoneNumberSearch

exports.AsYouType = require('./build/AsYouType').default

exports.formatIncompletePhoneNumber = require('./build/formatIncompletePhoneNumber').default
exports.parseIncompletePhoneNumber  = require('./build/parseIncompletePhoneNumber').default
exports.parsePhoneNumberCharacter   = require('./build/parseIncompletePhoneNumber').parsePhoneNumberCharacter
exports.parseDigits   = require('./build/parseDigits').default

// Deprecated: `DIGITS` were used by `react-phone-number-input`.
// Replaced by `parseDigits()`.
//
// Deprecated: `DIGIT_PLACEHOLDER` was used by `react-phone-number-input`.
// Not used anymore.
//
exports.DIGITS            = require('./build/parseDigits').DIGITS
exports.DIGIT_PLACEHOLDER = require('./build/AsYouType').DIGIT_PLACEHOLDER

exports.getCountryCallingCode = require('./build/getCountryCallingCode').default
// `getPhoneCode` name is deprecated, use `getCountryCallingCode` instead.
exports.getPhoneCode = exports.getCountryCallingCode

exports.Metadata = require('./build/metadata').default
exports.isSupportedCountry = require('./build/metadata').isSupportedCountry
exports.getExtPrefix = require('./build/metadata').getExtPrefix

exports.parseRFC3966 = require('./build/RFC3966').parseRFC3966
exports.formatRFC3966 = require('./build/RFC3966').formatRFC3966

// exports['default'] = ...