// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
export { parsePhoneNumberWithError, parsePhoneNumberWithError as parsePhoneNumber } from './exports/parsePhoneNumberWithError'
// `parsePhoneNumberFromString()` named export is now considered legacy:
// it has been promoted to a default export due to being too verbose.
export { parsePhoneNumberFromString, parsePhoneNumberFromString as default } from './exports/parsePhoneNumberFromString'

export { isValidPhoneNumber } from './exports/isValidPhoneNumber'
export { isPossiblePhoneNumber } from './exports/isPossiblePhoneNumber'

// Deprecated.
export { findNumbers } from './exports/findNumbers'
// Deprecated.
export { searchNumbers } from './exports/searchNumbers'

export { findPhoneNumbersInText } from './exports/findPhoneNumbersInText'
export { searchPhoneNumbersInText } from './exports/searchPhoneNumbersInText'
export { PhoneNumberMatcher } from './exports/PhoneNumberMatcher'

export { AsYouType } from './exports/AsYouType'

export { isSupportedCountry } from './exports/isSupportedCountry'
export { getCountries } from './exports/getCountries'
export { getCountryCallingCode } from './exports/getCountryCallingCode'
export { getExtPrefix } from './exports/getExtPrefix'

export { Metadata } from './exports/Metadata'
export { getExampleNumber } from './exports/getExampleNumber'

export { formatIncompletePhoneNumber } from './exports/formatIncompletePhoneNumber'

export {
	ParseError,
	parseIncompletePhoneNumber,
	parsePhoneNumberCharacter,
	parseDigits,
	parseRFC3966,
	formatRFC3966,
	DIGIT_PLACEHOLDER
} from '../core/index'
