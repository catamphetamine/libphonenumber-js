'use strict'

var parsePhoneNumberFromString = require('../build/parsePhoneNumberFromString').default

// ES5 `require()` "default" "interoperability" hack.
// https://github.com/babel/babel/issues/2212#issuecomment-131827986
// An alternative approach:
// https://www.npmjs.com/package/babel-plugin-add-module-exports
exports = module.exports = parsePhoneNumberFromString
exports['default'] = parsePhoneNumberFromString

exports.ParseError = require('../build/ParseError').default
var parsePhoneNumberWithError = require('../build/parsePhoneNumber').default
// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
exports.parsePhoneNumberWithError = parsePhoneNumberWithError
exports.parsePhoneNumber = parsePhoneNumberWithError

// `parsePhoneNumberFromString()` named export is now considered legacy:
// it has been promoted to a default export due to being too verbose.
exports.parsePhoneNumberFromString = parsePhoneNumberFromString

exports.findNumbers = require('../build/findNumbers').default
exports.searchNumbers = require('../build/searchNumbers').default
exports.findPhoneNumbersInText = require('../build/findPhoneNumbersInText').default
exports.searchPhoneNumbersInText = require('../build/searchPhoneNumbersInText').default
exports.PhoneNumberMatcher = require('../build/PhoneNumberMatcher').default

exports.AsYouType = require('../build/AsYouType').default

exports.Metadata = require('../build/metadata').default
exports.isSupportedCountry = require('../build/metadata').isSupportedCountry
exports.getCountries = require('../build/getCountries').default
exports.getCountryCallingCode = require('../build/metadata').getCountryCallingCode
exports.getExtPrefix = require('../build/metadata').getExtPrefix

exports.getExampleNumber = require('../build/getExampleNumber').default

exports.formatIncompletePhoneNumber = require('../build/formatIncompletePhoneNumber').default

exports.parseIncompletePhoneNumber = require('../build/parseIncompletePhoneNumber').default
exports.parsePhoneNumberCharacter = require('../build/parseIncompletePhoneNumber').parsePhoneNumberCharacter
exports.parseDigits = require('../build/helpers/parseDigits').default
exports.DIGIT_PLACEHOLDER = require('../build/AsYouTypeFormatter').DIGIT_PLACEHOLDER

exports.parseRFC3966 = require('../build/helpers/RFC3966').parseRFC3966
exports.formatRFC3966 = require('../build/helpers/RFC3966').formatRFC3966