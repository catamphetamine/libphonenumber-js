import getCountryByNationalNumber from './getCountryByNationalNumber.js'

const USE_NON_GEOGRAPHIC_COUNTRY_CODE = false

// Returns the exact country for the `nationalNumber`
// that belongs to the specified "country calling code".
export default function getCountryByCallingCode(callingCode, {
	nationalNumber: nationalPhoneNumber,
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
	return getCountryByNationalNumber(nationalPhoneNumber, {
		countries: possibleCountries,
		metadata: metadata.metadata
	})
}