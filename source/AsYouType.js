import Metadata from './metadata'
import PhoneNumber from './PhoneNumber'
import AsYouTypeState from './AsYouTypeState'
import AsYouTypeFormatter, { DIGIT_PLACEHOLDER } from './AsYouTypeFormatter'
import AsYouTypeParser, { extractFormattedDigitsAndPlus } from './AsYouTypeParser'
import getCountryByCallingCode from './helpers/getCountryByCallingCode'

const USE_NON_GEOGRAPHIC_COUNTRY_CODE = false

export default class AsYouType {
	/**
	 * @param {(string|object)?} [optionsOrDefaultCountry] - The default country used for parsing non-international phone numbers. Can also be an `options` object.
	 * @param {Object} metadata
	 */
	constructor(optionsOrDefaultCountry, metadata) {
		this.metadata = new Metadata(metadata)
		const [defaultCountry, defaultCallingCode] = this.getCountryAndCallingCode(optionsOrDefaultCountry)
		this.defaultCountry = defaultCountry
		this.defaultCallingCode = defaultCallingCode
		this.reset()
	}

	getCountryAndCallingCode(optionsOrDefaultCountry) {
		// Set `defaultCountry` and `defaultCallingCode` options.
		let defaultCountry
		let defaultCallingCode
		// Turns out `null` also has type "object". Weird.
		if (optionsOrDefaultCountry) {
			if (typeof optionsOrDefaultCountry === 'object') {
				defaultCountry = optionsOrDefaultCountry.defaultCountry
				defaultCallingCode = optionsOrDefaultCountry.defaultCallingCode
			} else {
				defaultCountry = optionsOrDefaultCountry
			}
		}
		if (defaultCountry && !this.metadata.hasCountry(defaultCountry)) {
			defaultCountry = undefined
		}
		if (defaultCallingCode) {
			/* istanbul ignore if */
			if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
				if (this.metadata.isNonGeographicCallingCode(defaultCallingCode)) {
					defaultCountry = '001'
				}
			}
		}
		return [defaultCountry, defaultCallingCode]
	}

	/**
	 * Inputs "next" phone number characters.
	 * @param  {string} text
	 * @return {string} Formatted phone number characters that have been input so far.
	 */
	input(text) {
		const {
			digits,
			justLeadingPlus
		} = this.parser.input(text, this.state)
		if (justLeadingPlus) {
			this.formattedOutput = '+'
		} else if (digits) {
			this.determineTheCountryIfNeeded()
			// Match the available formats by the currently available leading digits.
			if (this.state.nationalSignificantNumber) {
				this.formatter.narrowDownMatchingFormats(this.state)
			}
			let formattedNationalNumber
			if (this.metadata.hasSelectedNumberingPlan()) {
				formattedNationalNumber = this.formatter.format(digits, this.state)
			}
			if (formattedNationalNumber === undefined) {
				// See if another national (significant) number could be re-extracted.
				if (this.parser.reExtractNationalSignificantNumber(this.state)) {
					this.determineTheCountryIfNeeded()
					// If it could, then re-try formatting the new national (significant) number.
					const nationalDigits = this.state.getNationalDigits()
					if (nationalDigits) {
						formattedNationalNumber = this.formatter.format(nationalDigits, this.state)
					}
				}
			}
			this.formattedOutput = formattedNationalNumber
				? this.getFullNumber(formattedNationalNumber)
				: this.getNonFormattedNumber()
		}
		return this.formattedOutput
	}

	reset() {
		this.state = new AsYouTypeState({
			onCountryChange: (country) => {
				// Before version `1.6.0`, the official `AsYouType` formatter API
				// included the `.country` property of an `AsYouType` instance.
				// Since that property (along with the others) have been moved to
				// `this.state`, `this.country` property is emulated for compatibility
				// with the old versions.
				this.country = country
			},
			onCallingCodeChange: (country, callingCode) => {
				this.metadata.selectNumberingPlan(country, callingCode)
				this.formatter.reset(this.metadata.numberingPlan, this.state)
				this.parser.reset(this.metadata.numberingPlan)
			}
		})
		this.formatter = new AsYouTypeFormatter({
			state: this.state,
			metadata: this.metadata
		})
		this.parser = new AsYouTypeParser({
			defaultCountry: this.defaultCountry,
			defaultCallingCode: this.defaultCallingCode,
			metadata: this.metadata,
			state: this.state,
			onNationalSignificantNumberChange: () => {
				this.determineTheCountryIfNeeded()
				this.formatter.reset(this.metadata.numberingPlan, this.state)
			}
		})
		this.state.reset(this.defaultCountry, this.defaultCallingCode)
		this.formattedOutput = ''
		return this
	}

	/**
	 * Returns `true` if the phone number is being input in international format.
	 * In other words, returns `true` if and only if the parsed phone number starts with a `"+"`.
	 * @return {boolean}
	 */
	isInternational() {
		return this.state.international
	}

	/**
	 * Returns the "country calling code" part of the phone number.
	 * Returns `undefined` if the number is not being input in international format.
	 * Returns "country calling code" for "non-geographic" phone numbering plans too.
	 * @return {string} [callingCode]
	 */
	getCallingCode() {
		return this.state.callingCode
	}

	// A legacy alias.
	getCountryCallingCode() {
		return this.getCallingCode()
	}

	/**
	 * Returns a two-letter country code of the phone number.
	 * Returns `undefined` for "non-geographic" phone numbering plans.
	 * Returns `undefined` if no phone number has been input yet.
	 * @return {string} [country]
	 */
	getCountry() {
		const { digits, country } = this.state
		// If no digits have been input yet,
		// then `this.country` is the `defaultCountry`.
		// Won't return the `defaultCountry` in such case.
		if (!digits) {
			return
		}
		let countryCode = country
		/* istanbul ignore if */
		if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
			// `AsYouType.getCountry()` returns `undefined`
			// for "non-geographic" phone numbering plans.
			if (countryCode === '001') {
				countryCode = undefined
			}
		}
		return countryCode
	}

	determineTheCountryIfNeeded() {
		// Suppose a user enters a phone number in international format,
		// and there're several countries corresponding to that country calling code,
		// and a country has been derived from the number, and then
		// a user enters one more digit and the number is no longer
		// valid for the derived country, so the country should be re-derived
		// on every new digit in those cases.
		//
		// If the phone number is being input in national format,
		// then it could be a case when `defaultCountry` wasn't specified
		// when creating `AsYouType` instance, and just `defaultCallingCode` was specified,
		// and that "calling code" could correspond to a "non-geographic entity",
		// or there could be several countries corresponding to that country calling code.
		// In those cases, `this.country` is `undefined` and should be derived
		// from the number. Again, if country calling code is ambiguous, then
		// `this.country` should be re-derived with each new digit.
		//
		if (!this.state.country || this.isCountryCallingCodeAmbiguous()) {
			this.determineTheCountry()
		}
	}

	// Prepends `+CountryCode ` in case of an international phone number
	getFullNumber(formattedNationalNumber) {
		if (this.isInternational()) {
			const prefix = (text) => this.formatter.getInternationalPrefixBeforeCountryCallingCode(this.state, {
				spacing: text ? true : false
			}) + text
			const { callingCode } = this.state
			if (!callingCode) {
				return prefix(`${this.state.getDigitsWithoutInternationalPrefix()}`)
			}
			if (!formattedNationalNumber) {
				return prefix(callingCode)
			}
			return prefix(`${callingCode} ${formattedNationalNumber}`)
		}
		return formattedNationalNumber
	}

	getNonFormattedNationalNumberWithPrefix() {
		const {
			nationalSignificantNumber,
			complexPrefixBeforeNationalSignificantNumber,
			nationalPrefix
		} = this.state
		let number = nationalSignificantNumber
		const prefix = complexPrefixBeforeNationalSignificantNumber || nationalPrefix
		if (prefix) {
			number = prefix + number
		}
		return number
	}

	getNonFormattedNumber() {
		const { nationalSignificantNumberMatchesInput } = this.state
		return this.getFullNumber(
			nationalSignificantNumberMatchesInput
				? this.getNonFormattedNationalNumberWithPrefix()
				: this.state.getNationalDigits()
		)
	}

	getNonFormattedTemplate() {
		const number = this.getNonFormattedNumber()
		if (number) {
			return number.replace(/[\+\d]/g, DIGIT_PLACEHOLDER)
		}
	}

	isCountryCallingCodeAmbiguous() {
		const { callingCode } = this.state
		const countryCodes = this.metadata.getCountryCodesForCallingCode(callingCode)
		return countryCodes && countryCodes.length > 1
	}

	// Determines the country of the phone number
	// entered so far based on the country phone code
	// and the national phone number.
	determineTheCountry() {
		this.state.setCountry(getCountryByCallingCode(
			this.isInternational() ? this.state.callingCode : this.defaultCallingCode,
			this.state.nationalSignificantNumber,
			this.metadata
		))
	}

	/**
	 * Returns an instance of `PhoneNumber` class.
	 * Will return `undefined` if no national (significant) number
	 * digits have been entered so far, or if no `defaultCountry` has been
	 * set and the user enters a phone number not in international format.
	 */
	getNumber() {
		let {
			nationalSignificantNumber,
			carrierCode
		} = this.state
		if (this.isInternational()) {
			if (!this.state.callingCode) {
				return
			}
		} else {
			if (!this.state.country && !this.defaultCallingCode) {
				return
			}
		}
		if (!nationalSignificantNumber) {
			return
		}
		const countryCode = this.getCountry()
		const callingCode = this.getCountryCallingCode() || this.defaultCallingCode
		const phoneNumber = new PhoneNumber(
			countryCode || callingCode,
			nationalSignificantNumber,
			this.metadata.metadata
		)
		if (carrierCode) {
			phoneNumber.carrierCode = carrierCode
		}
		// Phone number extensions are not supported by "As You Type" formatter.
		return phoneNumber
	}

	/**
	 * Returns `true` if the phone number is "possible".
	 * Is just a shortcut for `PhoneNumber.isPossible()`.
	 * @return {boolean}
	 */
	isPossible() {
		const phoneNumber = this.getNumber()
		if (!phoneNumber) {
			return false
		}
		return phoneNumber.isPossible()
	}

	/**
	 * Returns `true` if the phone number is "valid".
	 * Is just a shortcut for `PhoneNumber.isValid()`.
	 * @return {boolean}
	 */
	isValid() {
		const phoneNumber = this.getNumber()
		if (!phoneNumber) {
			return false
		}
		return phoneNumber.isValid()
	}

	/**
	 * @deprecated
	 * This method is used in `react-phone-number-input/source/input-control.js`
	 * in versions before `3.0.16`.
	 */
	getNationalNumber() {
		return this.state.nationalSignificantNumber
	}

	/**
	 * Returns the phone number characters entered by the user.
	 * @return {string}
	 */
	getChars() {
		return (this.state.international ? '+' : '') + this.state.digits
	}

	/**
	 * Returns the template for the formatted phone number.
	 * @return {string}
	 */
	getTemplate() {
		return this.formatter.getTemplate(this.state) || this.getNonFormattedTemplate() || ''
	}
}