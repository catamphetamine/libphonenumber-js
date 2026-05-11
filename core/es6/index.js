export { default as PhoneNumber } from '../../es6-modern/PhoneNumber.js'
export { default as ParseError } from '../../es6-modern/ParseError.js'
// `parsePhoneNumber()` named export has been renamed to `parsePhoneNumberWithError()`.
export { default as parsePhoneNumberWithError, default as parsePhoneNumber } from '../../es6-modern/parsePhoneNumberWithError.js'

// `parsePhoneNumberFromString()` named export is now considered legacy:
// it has been promoted to a default export due to being too verbose.
export { default as default, default as parsePhoneNumberFromString } from '../../es6-modern/parsePhoneNumber.js'

export { default as isValidPhoneNumber } from '../../es6-modern/isValidPhoneNumber.js'
export { default as isPossiblePhoneNumber } from '../../es6-modern/isPossiblePhoneNumber.js'
export { default as validatePhoneNumberLength } from '../../es6-modern/validatePhoneNumberLength.js'

// Deprecated.
export { default as findNumbers } from '../../es6-modern/legacy/findNumbers.js'
export { default as searchNumbers } from '../../es6-modern/legacy/searchNumbers.js'

export { default as findPhoneNumbersInText } from '../../es6-modern/findPhoneNumbersInText.js'
export { default as searchPhoneNumbersInText } from '../../es6-modern/searchPhoneNumbersInText.js'
export { default as PhoneNumberMatcher } from '../../es6-modern/PhoneNumberMatcher.js'

export { default as AsYouType } from '../../es6-modern/AsYouType.js'

// Deprecated:
// `DIGIT_PLACEHOLDER` is the character that `AsYouType` formatter uses in a phone number template.
// It's basically an "x" character. I guess, there's no point in exporting it as a constant
// because the established convention is that it's an "x" character so everyone just assumes "x".
export { DIGIT_PLACEHOLDER } from '../../es6-modern/AsYouTypeFormatter.js'

export { default as getCountries } from '../../es6-modern/getCountries.js'
export { default as Metadata, isSupportedCountry, getCountryCallingCode, getExtPrefix } from '../../es6-modern/metadata.js'

export { default as getExampleNumber } from '../../es6-modern/getExampleNumber.js'

export { default as formatIncompletePhoneNumber } from '../../es6-modern/formatIncompletePhoneNumber.js'
export { default as parseIncompletePhoneNumber, parsePhoneNumberCharacter } from '../../es6-modern/parseIncompletePhoneNumber.js'
export { default as parseDigits } from '../../es6-modern/helpers/parseDigits.js'

export { parseRFC3966, formatRFC3966 } from '../../es6-modern/helpers/RFC3966.js'
