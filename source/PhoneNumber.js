import isPossibleNumber from './isPossibleNumber'
import isValidNumber from './validate'
import getNumberType from './getNumberType'
import formatNumber from './format'

export default class PhoneNumber {
	constructor(countryCallingCode, nationalNumber, metadata) {
		if (!countryCallingCode) {
			throw new TypeError('`countryCallingCode` not passed')
		}
		if (!nationalNumber) {
			throw new TypeError('`nationalNumber` not passed')
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