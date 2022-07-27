export default class AsYouTypeState {
	constructor({ onCountryChange, onCallingCodeChange }) {
		this.onCountryChange = onCountryChange
		this.onCallingCodeChange = onCallingCodeChange
	}

	reset(defaultCountry, defaultCallingCode) {
		this.international = false
		this.IDDPrefix = undefined
		this.missingPlus = undefined
		this.callingCode = undefined
		this.digits = ''
		this.resetNationalSignificantNumber()
		this.initCountryAndCallingCode(defaultCountry, defaultCallingCode)
	}

	resetNationalSignificantNumber() {
		this.nationalSignificantNumber = this.getNationalDigits()
		this.nationalSignificantNumberMatchesInput = true
		this.nationalPrefix = undefined
		this.carrierCode = undefined
		this.complexPrefixBeforeNationalSignificantNumber = undefined
	}

	update(properties) {
		for (const key of Object.keys(properties)) {
			this[key] = properties[key]
		}
	}

	initCountryAndCallingCode(country, callingCode) {
		this.setCountry(country)
		this.setCallingCode(callingCode)
	}

	setCountry(country) {
		this.country = country
		this.onCountryChange(country)
	}

	setCallingCode(callingCode) {
		this.callingCode = callingCode
		this.onCallingCodeChange(callingCode, this.country)
	}

	startInternationalNumber(country, callingCode) {
		// Prepend the `+` to parsed input.
		this.international = true
		// If a default country was set then reset it
		// because an explicitly international phone
		// number is being entered.
		this.initCountryAndCallingCode(country, callingCode)
	}

	appendDigits(nextDigits) {
		this.digits += nextDigits
	}

	appendNationalSignificantNumberDigits(nextDigits) {
		this.nationalSignificantNumber += nextDigits
	}

	/**
	 * Returns the part of `this.digits` that corresponds to the national number.
	 * Basically, all digits that have been input by the user, except for the
	 * international prefix and the country calling code part
	 * (if the number is an international one).
	 * @return {string}
	 */
	getNationalDigits() {
		if (this.international) {
			return this.digits.slice(
				(this.IDDPrefix ? this.IDDPrefix.length : 0) +
				(this.callingCode ? this.callingCode.length : 0)
			)
		}
		return this.digits
	}

	getDigitsWithoutInternationalPrefix() {
		if (this.international) {
			if (this.IDDPrefix) {
				return this.digits.slice(this.IDDPrefix.length)
			}
		}
		return this.digits
	}
}