import getCountryByNationalNumber from './getCountryByNationalNumber.js'

const USE_NON_GEOGRAPHIC_COUNTRY_CODE = false

/**
 * Returns the exact country that a given national (significant) number belongs to
 * in case of ambiguity, i.e. when multiple countries share the same "country calling code".
 * @param {string} [callingCode]
 * @param {string} [options.nationalNumber] — National (significant) number.
 * @param {Metadata} options.metadata — Metadata instance.
 * @returns {string?} Returns the most suitable country for this calling code and national (significant) number.
 */
export default function getCountryByCallingCode(callingCode, {
	nationalNumber,
	metadata
}) {
	/* istanbul ignore if */
	if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
		if (metadata.isNonGeographicCallingCode(callingCode)) {
			return '001'
		}
	}
	const possibleCountries = metadata.getCountryCodesForCallingCode(callingCode)
	if (!possibleCountries) {
		return
	}
	// If there's just one country corresponding to the country code,
	// then just return it, without further phone number digits validation.
	if (possibleCountries.length === 1) {
		return possibleCountries[0]
	}
	return getCountryByNationalNumber(nationalNumber, possibleCountries, metadata.metadata)
}