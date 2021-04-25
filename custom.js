// The `/custom` export has been long deprecated: use `/core` export instead.

'use strict'

var parsePhoneNumberFromString = require('./build/parsePhoneNumberFromString').default

// ES5 `require()` "default" "interoperability" hack.
// https://github.com/babel/babel/issues/2212#issuecomment-131827986
// An alternative approach:
// https://www.npmjs.com/package/babel-plugin-add-module-exports
exports = module.exports = parsePhoneNumberFromString
exports['default'] = parsePhoneNumberFromString

exports.ParseError = require('./build/ParseError').default
var parsePhoneNumberWithError = require('./build/parsePhoneNumber').default
// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
exports.parsePhoneNumber = parsePhoneNumberWithError
exports.parsePhoneNumberWithError = parsePhoneNumberWithError

// `parsePhoneNumberFromString()` named export is now considered legacy:
// it has been promoted to a default export due to being too verbose.
exports.parsePhoneNumberFromString = parsePhoneNumberFromString

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
exports.isValidNumber      = require('./build/validate').default
exports.isValidNumberForRegion = require('./build/isValidNumberForRegion').default

// Deprecated.
exports.isPossibleNumber   = require('./build/isPossibleNumber').default

exports.findNumbers        = require('./build/findNumbers').default
exports.searchNumbers      = require('./build/searchNumbers').default
exports.findPhoneNumbersInText = require('./build/findPhoneNumbersInText').default
exports.searchPhoneNumbersInText = require('./build/searchPhoneNumbersInText').default
exports.PhoneNumberMatcher = require('./build/PhoneNumberMatcher').default

// Deprecated.
exports.findPhoneNumbers   = require('./build/findPhoneNumbers').default
exports.searchPhoneNumbers = require('./build/findPhoneNumbers').searchPhoneNumbers
exports.PhoneNumberSearch  = require('./build/findPhoneNumbers_').PhoneNumberSearch

exports.AsYouType = require('./build/AsYouType').default

exports.formatIncompletePhoneNumber = require('./build/formatIncompletePhoneNumber').default
exports.parseIncompletePhoneNumber  = require('./build/parseIncompletePhoneNumber').default
exports.parsePhoneNumberCharacter   = require('./build/parseIncompletePhoneNumber').parsePhoneNumberCharacter
exports.parseDigits   = require('./build/helpers/parseDigits').default

// Deprecated: `DIGITS` were used by `react-phone-number-input`.
// Replaced by `parseDigits()`.
//
// Deprecated: `DIGIT_PLACEHOLDER` was used by `react-phone-number-input`.
// Not used anymore.
//
exports.DIGITS            = require('./build/helpers/parseDigits').DIGITS
exports.DIGIT_PLACEHOLDER = require('./build/AsYouTypeFormatter').DIGIT_PLACEHOLDER

exports.getCountries = require('./build/getCountries').default
exports.getCountryCallingCode = require('./build/getCountryCallingCode').default
// `getPhoneCode` name is deprecated, use `getCountryCallingCode` instead.
exports.getPhoneCode = exports.getCountryCallingCode

exports.Metadata = require('./build/metadata').default
exports.isSupportedCountry = require('./build/metadata').isSupportedCountry
exports.getExtPrefix = require('./build/metadata').getExtPrefix

exports.parseRFC3966 = require('./build/helpers/RFC3966').parseRFC3966
exports.formatRFC3966 = require('./build/helpers/RFC3966').formatRFC3966

// exports['default'] = ...