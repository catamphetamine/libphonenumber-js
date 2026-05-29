// This "state" object simply holds the state of the "AsYouType" parser:
//
// Sidenote:
//   `state.callingCode` and `state.country` are somewhat independent from one another
//   and there could be situations when one is defined but the other is not.
//   * Situations when `state.country` would be defined but `state.callingCode` would be `undefined`:
// 		 * When `defaultCountry` is specified and inputting a phone number not in "international" format.
//     * When `defaultCountry` is specified and inputting a phone number in "international" format,
//       but before the `+` character has been input.
//   * Situations when `state.country` would be `undefined` but `state.callingCode` would be defined:
//     * When `defaultCountry` is not specified and inputting a phone number in "international" format,
//       and the "calling code" part is already complete, but multiple countries share this "calling code"
//       and there's not enough national (significant) number digits yet to determine the exact country.
//   * In any other sigutations, `state.country` and `state.callingCode` are either both defined or both `undefined`.
//     * When they're both defined, `state.callingCode` always corresponds to `state.country`.
//       So both are always consistent in this case.
//
// * `country?: string` — The exact country of the phone number, if it could be determined.
//                        When inputting a phone number in "international" format, it will derive the `country` from "country calling code" and the phone number digits.
//                        When inputting a phone number in "national" format, it will derive the `country` from `defaultCountry` that was specified when creating the `AsYouType` formatter.
//                        Sidenote: If `USE_NON_GEOGRAPHIC_COUNTRY_CODE` flag was `true`, then for "non-geographic phone numbers" `state.country` would've been "001".
// * `callingCode?: string` — "Country calling code" that has been extracted from the input phone number.
//                        When inputting a phone number in "international" format, it will extract the "country calling code" from the digits that follow the "+" character.
//                        When inputting a phone number in "national" format, `callingCode` will be `undefined`.
// * `digits: string` — Phone number digits that have been input so far, including the "+" character, if present. In case of inputting non-arabic digits, those will be converted to arabic ones.
// * `international: boolean` — Whether the phone number is being input in "international" format, i.e. with a "+" character.
// * `missingPlus: boolean` — Whether it's a phone number in "international" format that is missing the leading "+" character for some reason — apparently, Google thinks that it's a common mistake when inputting a phone number.
// * `IDDPrefix?: string` — An "IDD prefix", when the phone number is being input in an "out-of-country dialing" format. https://wikitravel.org/en/International_dialling_prefix
// * `carrierCode?: string` — A "carrier code", if the phone number contains it. Normally, those can only be present in Colombia or Brazil, and only when calling from mobile phones to fixed-line numbers.
// * `nationalPrefix?: string` — "National prefix", if present in the phone number input.
// * `nationalSignificantNumber?: string` — National (significant) number digits that have been input so far.
// * `nationalSignificantNumberIsModified: boolean` — Tells if the parsed national (significant) number is present as-is in the input string. For example, when inputting "0343515551212999" Argentinian mobile number, the parsed national (significant) number is "93435551212999". There, one can see how it stripped "0" national prefix and prepended a "9", because that's how it is instructed to do in Argentina's metadata. So in the described example, the parsed national (significant) number is not present as-is in the input string. Instead, it's "modified" in the input string. https://gitlab.com/caamphetamine/libphonenumber-js/-/blob/master/METADATA.md#national_prefix_for_parsing--national_prefix_transform_rule
// * `prefixBeforeNationalSignificantNumberThatIsNotNationalPrefix?: string` — In some countries, a phone number could have a prefix that is not a "national prefix" but rather some other type of "utility" prefix.
//                                                                             For example, when calling within Australia, one could prepend `1831` prefix to hide caller's phone number.
//                                                                             https://gitlab.com/catamphetamine/libphonenumber-js/-/blob/master/METADATA.md#national_prefix_for_parsing--national_prefix_transform_rule
//
export default class AsYouTypeState {
	constructor({ onCountryChange, onCallingCodeChange }) {
		this.onCountryChange = onCountryChange
		this.onCallingCodeChange = onCallingCodeChange
	}

	reset({ country, callingCode }) {
		this.international = false
		this.missingPlus = false
		this.IDDPrefix = undefined
		this.callingCode = undefined
		this.digits = ''
		this.resetNationalSignificantNumber()
		this.initCountryAndCallingCode(country, callingCode)
	}

	resetNationalSignificantNumber() {
		this.nationalSignificantNumber = this.getNationalDigits()
		this.nationalSignificantNumberIsModified = false
		this.nationalPrefix = undefined
		this.carrierCode = undefined
		this.prefixBeforeNationalSignificantNumberThatIsNotNationalPrefix = undefined
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