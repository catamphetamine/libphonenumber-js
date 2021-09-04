// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
export { parsePhoneNumberWithError, parsePhoneNumberWithError as parsePhoneNumber } from './min/exports/parsePhoneNumberWithError'
// `parsePhoneNumberFromString()` named export is now considered legacy:
// it has been promoted to a default export due to being too verbose.
export { parsePhoneNumberFromString, parsePhoneNumberFromString as default } from './min/exports/parsePhoneNumberFromString'

export { isValidPhoneNumber } from './min/exports/isValidPhoneNumber'
export { isPossiblePhoneNumber } from './min/exports/isPossiblePhoneNumber'
export { validatePhoneNumberLength } from './min/exports/validatePhoneNumberLength'

// Deprecated.
export { findNumbers } from './min/exports/findNumbers'
// Deprecated.
export { searchNumbers } from './min/exports/searchNumbers'

export { findPhoneNumbersInText } from './min/exports/findPhoneNumbersInText'
export { searchPhoneNumbersInText } from './min/exports/searchPhoneNumbersInText'
export { PhoneNumberMatcher } from './min/exports/PhoneNumberMatcher'

export { AsYouType } from './min/exports/AsYouType'
export { DIGIT_PLACEHOLDER } from './es6/AsYouTypeFormatter'

export { isSupportedCountry } from './min/exports/isSupportedCountry'
export { getCountries } from './min/exports/getCountries'
// `getPhoneCode` name is deprecated, use `getCountryCallingCode` instead.
export { getCountryCallingCode, getCountryCallingCode as getPhoneCode } from './min/exports/getCountryCallingCode'
export { getExtPrefix } from './min/exports/getExtPrefix'

export { Metadata } from './min/exports/Metadata'
export { getExampleNumber } from './min/exports/getExampleNumber'

export { formatIncompletePhoneNumber } from './min/exports/formatIncompletePhoneNumber'

export {
	ParseError,
	parseIncompletePhoneNumber,
	parsePhoneNumberCharacter,
	parseDigits,
	parseRFC3966,
	formatRFC3966
} from './core/index'

// Deprecated (old) exports.
export { parse as parseNumber, parse } from './index.es6.exports/parse'
export { format as formatNumber, format } from './index.es6.exports/format'
export { getNumberType } from './index.es6.exports/getNumberType'
export { isPossibleNumber } from './index.es6.exports/isPossibleNumber'
export { isValidNumber } from './index.es6.exports/isValidNumber'
export { isValidNumberForRegion } from './index.es6.exports/isValidNumberForRegion'
export { findPhoneNumbers } from './index.es6.exports/findPhoneNumbers'
export { searchPhoneNumbers } from './index.es6.exports/searchPhoneNumbers'
export { PhoneNumberSearch } from './index.es6.exports/PhoneNumberSearch'

// Deprecated DIGITS export.
// (it was used in `react-phone-number-input`)
export { DIGITS } from './es6/helpers/parseDigits'

// Deprecated "custom" exports.
export { default as parseCustom } from './es6/parse'
export { default as formatCustom } from './es6/format'
export { default as isValidNumberCustom } from './es6/validate'
export { default as findPhoneNumbersCustom } from './es6/findPhoneNumbers'
export { searchPhoneNumbers as searchPhoneNumbersCustom } from './es6/findPhoneNumbers'
export { PhoneNumberSearch as PhoneNumberSearchCustom } from './es6/findPhoneNumbers_'
export { default as getNumberTypeCustom } from './es6/getNumberType'
export { default as getCountryCallingCodeCustom, default as getPhoneCodeCustom } from './es6/getCountryCallingCode'
export { default as AsYouTypeCustom } from './es6/AsYouType'
