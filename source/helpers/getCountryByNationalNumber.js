import Metadata from '../metadata.js'
import getNumberType from './getNumberType.js'

export default function getCountryByNationalNumber(possibleCountries, nationalPhoneNumber, metadata) {
	// Re-create `metadata` because it will be selecting a `country`.
	metadata = new Metadata(metadata)
	for (const country of possibleCountries) {
		metadata.country(country)
		// "Leading digits" patterns are only defined for about 20% of all countries.
		// By definition, matching "leading digits" is a sufficient but not a necessary
		// condition for a phone number to belong to a country.
		// The point of "leading digits" check is that it's the fastest one to get a match.
		// https://gitlab.com/catamphetamine/libphonenumber-js/blob/master/METADATA.md#leading_digits
		if (metadata.leadingDigits()) {
			if (nationalPhoneNumber &&
				nationalPhoneNumber.search(metadata.leadingDigits()) === 0) {
				return country
			}
		}
		// Else perform full validation with all of those
		// fixed-line/mobile/etc regular expressions.
		else if (getNumberType({ phone: nationalPhoneNumber, country }, undefined, metadata.metadata)) {
			return country
		}
	}
}