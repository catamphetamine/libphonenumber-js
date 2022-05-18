// The `/custom` export has been long deprecated: use `/core` export instead.

'use strict'

var parsePhoneNumberFromString = require('./build/parsePhoneNumberFromString.js').default

// ES5 `require()` "default" "interoperability" hack.
// https://github.com/babel/babel/issues/2212#issuecomment-131827986
// An alternative approach:
// https://www.npmjs.com/package/babel-plugin-add-module-exports
exports = module.exports = parsePhoneNumberFromString
exports['default'] = parsePhoneNumberFromString

exports.ParseError = require('./build/ParseError.js').default
var parsePhoneNumberWithError = require('./build/parsePhoneNumber.js').default
// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
exports.parsePhoneNumber = parsePhoneNumberWithError
exports.parsePhoneNumberWithError = parsePhoneNumberWithError

// `parsePhoneNumberFromString()` named export is now considered legacy:
// it has been promoted to a default export due to being too verbose.
exports.parsePhoneNumberFromString = parsePhoneNumberFromString

// Deprecated: remove `parse()` export in 2.0.0.
// (renamed to `parseNumber()`)
exports.parse              = require('./build/parse.js').default
exports.parseNumber        = require('./build/parse.js').default
// Deprecated: remove `format()` export in 2.0.0.
// (renamed to `formatNumber()`)
exports.format             = require('./build/format.js').default
exports.formatNumber       = require('./build/format.js').default
exports.getNumberType      = require('./build/getNumberType.js').default
exports.getExampleNumber   = require('./build/getExampleNumber.js').default
exports.isValidNumber      = require('./build/validate.js').default
exports.isValidNumberForRegion = require('./build/isValidNumberForRegion.js').default

// Deprecated.
exports.isPossibleNumber   = require('./build/isPossibleNumber.js').default

exports.findNumbers        = require('./build/findNumbers.js').default
exports.searchNumbers      = require('./build/searchNumbers.js').default
exports.findPhoneNumbersInText = require('./build/findPhoneNumbersInText.js').default
exports.searchPhoneNumbersInText = require('./build/searchPhoneNumbersInText.js').default
exports.PhoneNumberMatcher = require('./build/PhoneNumberMatcher.js').default

// Deprecated.
exports.findPhoneNumbers   = require('./build/findPhoneNumbers.js').default
exports.searchPhoneNumbers = require('./build/findPhoneNumbers.js').searchPhoneNumbers
exports.PhoneNumberSearch  = require('./build/findPhoneNumbers_.js').PhoneNumberSearch

exports.AsYouType = require('./build/AsYouType.js').default

exports.formatIncompletePhoneNumber = require('./build/formatIncompletePhoneNumber.js').default
exports.parseIncompletePhoneNumber  = require('./build/parseIncompletePhoneNumber.js').default
exports.parsePhoneNumberCharacter   = require('./build/parseIncompletePhoneNumber.js').parsePhoneNumberCharacter
exports.parseDigits   = require('./build/helpers/parseDigits.js').default

// Deprecated: `DIGITS` were used by `react-phone-number-input`.
// Replaced by `parseDigits()`.
//
// Deprecated: `DIGIT_PLACEHOLDER` was used by `react-phone-number-input`.
// Not used anymore.
//
exports.DIGITS            = require('./build/helpers/parseDigits.js').DIGITS
exports.DIGIT_PLACEHOLDER = require('./build/AsYouTypeFormatter.js').DIGIT_PLACEHOLDER

exports.getCountries = require('./build/getCountries.js').default
exports.getCountryCallingCode = require('./build/getCountryCallingCode.js').default
// `getPhoneCode` name is deprecated, use `getCountryCallingCode` instead.
exports.getPhoneCode = exports.getCountryCallingCode

exports.Metadata = require('./build/metadata.js').default
exports.isSupportedCountry = require('./build/metadata.js').isSupportedCountry
exports.getExtPrefix = require('./build/metadata.js').getExtPrefix

exports.parseRFC3966 = require('./build/helpers/RFC3966.js').parseRFC3966
exports.formatRFC3966 = require('./build/helpers/RFC3966.js').formatRFC3966

// exports['default'] = ...