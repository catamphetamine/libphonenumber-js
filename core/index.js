export { default as ParseError } from '../es6/ParseError'
// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
export { default as parsePhoneNumberWithError, default as parsePhoneNumber } from '../es6/parsePhoneNumber'

// `parsePhoneNumberFromString()` named export is now considered legacy:
// it has been promoted to a default export due to being too verbose.
export { default as default, default as parsePhoneNumberFromString } from '../es6/parsePhoneNumberFromString'

export { default as isValidPhoneNumber } from '../es6/isValidPhoneNumber'
export { default as isPossiblePhoneNumber } from '../es6/isPossiblePhoneNumber'

// Deprecated.
export { default as findNumbers } from '../es6/findNumbers'
// Deprecated.
export { default as searchNumbers } from '../es6/searchNumbers'

export { default as findPhoneNumbersInText } from '../es6/findPhoneNumbersInText'
export { default as searchPhoneNumbersInText } from '../es6/searchPhoneNumbersInText'
export { default as PhoneNumberMatcher } from '../es6/PhoneNumberMatcher'

export { default as AsYouType } from '../es6/AsYouType'
export { DIGIT_PLACEHOLDER } from '../es6/AsYouTypeFormatter'

export { default as getCountries } from '../es6/getCountries'
export { default as Metadata, isSupportedCountry, getCountryCallingCode, getExtPrefix } from '../es6/metadata'

export { default as getExampleNumber } from '../es6/getExampleNumber'

export { default as formatIncompletePhoneNumber } from '../es6/formatIncompletePhoneNumber'
export { default as parseIncompletePhoneNumber, parsePhoneNumberCharacter } from '../es6/parseIncompletePhoneNumber'
export { default as parseDigits } from '../es6/helpers/parseDigits'

export { parseRFC3966, formatRFC3966 } from '../es6/helpers/RFC3966'
