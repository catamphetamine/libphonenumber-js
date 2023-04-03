import Metadata from './metadata.js'
import isPossibleNumber from './isPossible.js'
import isValidNumber from './isValid.js'
// import checkNumberLength from './helpers/checkNumberLength.js'
import getNumberType from './helpers/getNumberType.js'
import getPossibleCountriesForNumber from './helpers/getPossibleCountriesForNumber.js'
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
		if (!countryOrCountryCallingCode) {
			throw new TypeError('`country` or `countryCallingCode` not passed')
		}
		if (!nationalNumber) {
			throw new TypeError('`nationalNumber` not passed')
		}
		if (!metadata) {
			throw new TypeError('`metadata` not passed')
		}
		const { country, countryCallingCode } = getCountryAndCountryCallingCode(
			countryOrCountryCallingCode,
			metadata
		)
		this.country = country
		this.countryCallingCode = countryCallingCode
		this.nationalNumber = nationalNumber
		this.number = '+' + this.countryCallingCode + this.nationalNumber
		this.metadata = metadata
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
			this.metadata
		)
	}

	isPossible() {
		return isPossibleNumber(this, { v2: true }, this.metadata)
	}

	isValid() {
		return isValidNumber(this, { v2: true }, this.metadata)
	}

	isNonGeographic() {
		const metadata = new Metadata(this.metadata)
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
	// 	const metadata = new Metadata(this.metadata)
	// 	metadata.selectNumberingPlan(this.countryCallingCode)
	// 	const result = checkNumberLength(this.nationalNumber, metadata)
	// 	if (result !== 'IS_POSSIBLE') {
	// 		return result
	// 	}
	// }

	getType() {
		return getNumberType(this, { v2: true }, this.metadata)
	}

	format(format, options) {
		return formatNumber(
			this,
			format,
			options ? { ...options, v2: true } : { v2: true },
			this.metadata
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