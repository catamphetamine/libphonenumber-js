import Metadata from '../metadata.js'
import isCountryCode from './isCountryCode.js'

const USE_NON_GEOGRAPHIC_COUNTRY_CODE = false

export default function getCountryAndCallingCodeFromOneOfThem(countryOrCallingCode, metadataJson) {
	let country
	let callingCode

	const metadata = new Metadata(metadataJson)
	// If country code is passed then derive `countryCallingCode` from it.
	// Also store the country code as `.country`.
	if (isCountryCode(countryOrCallingCode)) {
		country = countryOrCallingCode
		metadata.selectNumberingPlan(country)
		callingCode = metadata.countryCallingCode()
	} else {
		callingCode = countryOrCallingCode
		/* istanbul ignore if */
		if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
			if (metadata.isNonGeographicCallingCode(callingCode)) {
				country = '001'
			}
		}
	}

	return {
		country,
		callingCode
	}
}