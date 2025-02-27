import Metadata, { validateMetadata } from './metadata.js'
import isPossibleNumber from './isPossible.js'
import isValidNumber from './isValid.js'
// import checkNumberLength from './helpers/checkNumberLength.js'
import getNumberType from './helpers/getNumberType.js'
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
		if (typeof countryOrCountryCallingCode === 'string') {
			if (countryOrCountryCallingCode[0] === '+' && !nationalNumber) {
				throw new TypeError('`metadata` argument not passed')
			}
			if (isObject(nationalNumber) && isObject(nationalNumber.countries)) {
				metadata = nationalNumber
				const e164Number = countryOrCountryCallingCode
				if (!E164_NUMBER_REGEXP.test(e164Number)) {
					throw new Error('Invalid `number` argument passed: must consist of a "+" followed by digits')
				}
				const { countryCallingCode, number } = extractCountryCallingCode(e164Number, undefined, undefined, metadata)
				nationalNumber = number
				countryOrCountryCallingCode = countryCallingCode
				if (!nationalNumber) {
					throw new Error('Invalid `number` argument passed: too short')
				}
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
		const { country, countryCallingCode } = getCountryAndCountryCallingCode(
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

	// This function was originally meant to be an equivalent for `validatePhoneNumberLength()`,
	// but later it was found out that it doesn't include the possible `TOO_SHORT` result
	// returned from `parsePhoneNumberWithError()` in the original `validatePhoneNumberLength()`,
	// so eventually I simply commented out this method from the `PhoneNumber` class
	// and just left the `validatePhoneNumberLength()` function, even though that one would require
	// and additional step to also validate the actual country / calling code of the phone number.
	// validateLength() {
	// 	const metadata = new Metadata(this.getMetadata())
	// 	metadata.selectNumberingPlan(this.countryCallingCode)
	// 	const result = checkNumberLength(this.nationalNumber, metadata)
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

const isCountryCode = (value) => /^[A-Z]{2}$/.test(value)

function getCountryAndCountryCallingCode(countryOrCountryCallingCode, metadataJson) {
	let country
	let countryCallingCode

	const metadata = new Metadata(metadataJson)
	// If country code is passed then derive `countryCallingCode` from it.
	// Also store the country code as `.country`.
	if (isCountryCode(countryOrCountryCallingCode)) {
		country = countryOrCountryCallingCode
		metadata.selectNumberingPlan(country)
		countryCallingCode = metadata.countryCallingCode()
	} else {
		countryCallingCode = countryOrCountryCallingCode
		/* istanbul ignore if */
		if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
			if (metadata.isNonGeographicCallingCode(countryCallingCode)) {
				country = '001'
			}
		}
	}

	return {
		country,
		countryCallingCode
	}
}

const E164_NUMBER_REGEXP = /^\+\d+$/