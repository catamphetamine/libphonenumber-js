import Metadata, { validateMetadata } from './metadata.js'
import isPossibleNumber from './isPossible.js'
import isValidNumber from './isValid.js'
import getNumberType from './helpers/getNumberType.js'
import getCountryAndCallingCodeFromOneOfThem from './helpers/getCountryAndCallingCodeFromOneOfThem.js'
import getPossibleCountriesForNumber from './helpers/getPossibleCountriesForNumber.js'
import extractCountryCallingCode from './helpers/extractCountryCallingCode.js'
import isObject from './helpers/isObject.js'
import formatNumber from './format.js'

const USE_NON_GEOGRAPHIC_COUNTRY_CODE = false

export default class PhoneNumber {
	/**
	 * @param  {string} countryOrCountryCallingCode
	 * @param  {string} nationalNumber
	 * @param  {object} metadata — Metadata JSON
	 * @return {PhoneNumber}
	 */
	constructor(countryOrCountryCallingCode, nationalNumber, metadata) {
		// Validate `countryOrCountryCallingCode` argument.
		if (!countryOrCountryCallingCode) {
			throw new TypeError('First argument is required')
		}
		if (typeof countryOrCountryCallingCode !== 'string') {
			throw new TypeError('First argument must be a string')
		}

		// In case of public API use: `constructor(number, metadata)`.
		// Transform the arguments from `constructor(number, metadata)` to
		// `constructor(countryOrCountryCallingCode, nationalNumber, metadata)`.
		if (countryOrCountryCallingCode[0] === '+' && !nationalNumber) {
			throw new TypeError('`metadata` argument not passed')
		}
		if (isObject(nationalNumber) && isObject(nationalNumber.countries)) {
			metadata = nationalNumber
			const e164Number = countryOrCountryCallingCode
			if (!E164_NUMBER_REGEXP.test(e164Number)) {
				throw new Error('Invalid `number` argument passed: must consist of a "+" followed by digits')
			}
			const { countryCallingCode, number } = extractCountryCallingCode(e164Number, undefined, undefined, undefined, metadata)
			nationalNumber = number
			countryOrCountryCallingCode = countryCallingCode
			if (!nationalNumber) {
				throw new Error('Invalid `number` argument passed: too short')
			}
		}

		// Validate `nationalNumber` argument.
		if (!nationalNumber) {
			throw new TypeError('`nationalNumber` argument is required')
		}
		if (typeof nationalNumber !== 'string') {
			throw new TypeError('`nationalNumber` argument must be a string')
		}

		// Validate `metadata` argument.
		validateMetadata(metadata)

		// Initialize properties.
		const { country, callingCode: countryCallingCode } = getCountryAndCallingCodeFromOneOfThem(
			countryOrCountryCallingCode,
			metadata
		)
		this.country = country
		this.countryCallingCode = countryCallingCode
		this.nationalNumber = nationalNumber
		this.number = '+' + this.countryCallingCode + this.nationalNumber
		// Exclude `metadata` property output from `PhoneNumber.toString()`
		// so that it doesn't clutter the console output of Node.js.
		// Previously, when Node.js did `console.log(new PhoneNumber(...))`,
		// it would output the whole internal structure of the `metadata` object.
		this.getMetadata = () => metadata
	}

	setExt(ext) {
		this.ext = ext
	}

	getPossibleCountries() {
		if (this.country) {
			return [this.country]
		}
		return getPossibleCountriesForNumber(
			this.countryCallingCode,
			this.nationalNumber,
			this.getMetadata()
		)
	}

	isPossible() {
		return isPossibleNumber(this, { v2: true }, this.getMetadata())
	}

	isValid() {
		return isValidNumber(this, { v2: true }, this.getMetadata())
	}

	isNonGeographic() {
		const metadata = new Metadata(this.getMetadata())
		return metadata.isNonGeographicCallingCode(this.countryCallingCode)
	}

	isEqual(phoneNumber) {
		return this.number === phoneNumber.number && this.ext === phoneNumber.ext
	}

	// `validateLength()` method was originally meant to be an equivalent for `validatePhoneNumberLength()`.
	//
	// Later, it became apparent that it's not really a true equivalent.
	// The reason is that a `PhoneNumber` instance is not created
	// when the phone number string is too short for it to be considered a valid phone number:
	// * When there must be at least 2 national (significant) number digits: `"1"`.
  // * When the country calling code part of an international number is incomplete: `"+12"`.
	//
	// So leaving this `validateLength()` method here would suggest a hidden anti-pattern
	// of using it instead of `validatePhoneNumberLength()` while ignoring
	// the "too short to be even possible" case from phone number length validation.
	// And ignoring that case wouldn't make any sense in a real-world application
	// because it would still be a valid case that should be handled.
	//
	// Because of that, this method was eventually commented out in order to not introduce
	// that kind of an anti-pattern.
	//
	// validateLength() {
	// 	const result = checkNumberLength(
	// 		this.nationalNumber,
	// 		undefined,
	// 		this.getMetadata()
	// 	)
	// 	if (result !== 'IS_POSSIBLE') {
	// 		return result
	// 	}
	// }

	getType() {
		return getNumberType(this, { v2: true }, this.getMetadata())
	}

	format(format, options) {
		return formatNumber(
			this,
			format,
			options ? { ...options, v2: true } : { v2: true },
			this.getMetadata()
		)
	}

	formatNational(options) {
		return this.format('NATIONAL', options)
	}

	formatInternational(options) {
		return this.format('INTERNATIONAL', options)
	}

	getURI(options) {
		return this.format('RFC3966', options)
	}
}

const E164_NUMBER_REGEXP = /^\+\d+$/