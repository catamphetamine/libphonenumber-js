'use strict'

exports = module.exports = {}

exports.ParseError = require('../build/ParseError').default
exports.parsePhoneNumber = require('../build/parsePhoneNumber').default
exports.parsePhoneNumberFromString = require('../build/parsePhoneNumberFromString').default

exports.findNumbers = require('../build/findNumbers').default
exports.searchNumbers = require('../build/searchNumbers').default
exports.PhoneNumberMatcher = require('../build/PhoneNumberMatcher').default

exports.AsYouType = require('../build/AsYouType').default

exports.Metadata = require('../build/metadata').default
exports.isSupportedCountry = require('../build/metadata').isSupportedCountry
exports.getCountryCallingCode = require('../build/metadata').getCountryCallingCode
exports.getExtPrefix = require('../build/metadata').getExtPrefix

exports.getExampleNumber = require('../build/getExampleNumber').default

exports.formatIncompletePhoneNumber = require('../build/formatIncompletePhoneNumber').default
exports.parseIncompletePhoneNumber = require('../build/parseIncompletePhoneNumber').default
exports.parsePhoneNumberCharacter = require('../build/parseIncompletePhoneNumber').parsePhoneNumberCharacter
exports.parseDigits = require('../build/parseDigits').default

exports.parseRFC3966 = require('../build/RFC3966').parseRFC3966
exports.formatRFC3966 = require('../build/RFC3966').formatRFC3966