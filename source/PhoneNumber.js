import Metadata from './metadata'
import isPossibleNumber from './isPossibleNumber_'
import isValidNumber from './validate_'
import isValidNumberForRegion from './isValidNumberForRegion_'
import getNumberType from './getNumberType_'
import formatNumber from './format_'

export default class PhoneNumber {
	constructor(countryCallingCode, nationalNumber, metadata) {
		if (!countryCallingCode) {
			throw new TypeError('`countryCallingCode` not passed')
		}
		if (!nationalNumber) {
			throw new TypeError('`nationalNumber` not passed')
		}
		// If country code is passed then derive `countryCallingCode` from it.
		// Also store the country code as `.country`.
		if (isCountryCode(countryCallingCode)) {
			this.country = countryCallingCode
			const _metadata = new Metadata(metadata)
			_metadata.country(countryCallingCode)
			countryCallingCode = _metadata.countryCallingCode()
		}
		this.countryCallingCode = countryCallingCode
		this.nationalNumber = nationalNumber
		this.number = '+' + this.countryCallingCode + this.nationalNumber
		this.metadata = metadata
	}

	isPossible() {
		return isPossibleNumber(this, { v2: true }, this.metadata)
	}

	isValid() {
		return isValidNumber(this, { v2: true }, this.metadata)
	}

	// // Is just an alias for `this.isValid() && this.country === country`.
	// // https://github.com/googlei18n/libphonenumber/blob/master/FAQ.md#when-should-i-use-isvalidnumberforregion
	// isValidForRegion(country) {
	// 	return isValidNumberForRegion(this, country, { v2: true }, this.metadata)
	// }

	getType() {
		return getNumberType(this, { v2: true }, this.metadata)
	}

	format(format, options) {
		return formatNumber(this, format, options ? { ...options, v2: true } : { v2: true }, this.metadata)
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