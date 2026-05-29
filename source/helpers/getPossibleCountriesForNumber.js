import Metadata from '../metadata.js'

/**
 * Returns a list of countries that the phone number could potentially belong to.
 * @param  {string} callingCode — Calling code.
 * @param  {string} nationalNumber — National (significant) number.
 * @param  {object} metadata — Metadata.
 * @return {string[]} A list of possible countries.
 */
export default function getPossibleCountriesForNumber(callingCode, nationalNumber, metadata) {
	const _metadata = new Metadata(metadata)
	let possibleCountries = _metadata.getCountryCodesForCallingCode(callingCode)
	if (!possibleCountries) {
		return []
	}
	return possibleCountries.filter((country) => {
		return couldNationalNumberBelongToCountry(nationalNumber, country, metadata)
	})
}

function couldNationalNumberBelongToCountry(nationalNumber, country, metadataJson) {
	const metadata = new Metadata(metadataJson)
	metadata.selectNumberingPlan(country)
	return metadata.numberingPlan.possibleLengths().indexOf(nationalNumber.length) >= 0
}