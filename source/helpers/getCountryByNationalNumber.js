import Metadata from '../metadata.js'
import getNumberType from './getNumberType.js'

// Returns the exact country that the `nationalPhoneNumber` belongs to
// in cases of ambiguity, i.e. when multiple countries share the same "country calling code".
export default function getCountryByNationalNumber(nationalPhoneNumber, {
	countries,
	metadata
}) {
	// Re-create `metadata` because it will be selecting a `country`.
	metadata = new Metadata(metadata)

	// const matchingCountries = []

	for (const country of countries) {
		metadata.selectNumberingPlan(country)
		// "Leading digits" patterns are only defined for about 20% of all countries.
		// By definition, matching "leading digits" is a sufficient but not a necessary
		// condition for a phone number to belong to a country.
		// The point of "leading digits" check is that it's the fastest one to get a match.
		// https://gitlab.com/catamphetamine/libphonenumber-js/blob/master/METADATA.md#leading_digits
		// I'd suppose that "leading digits" patterns are mutually exclusive for different countries
		// because of the intended use of that feature.
		if (metadata.leadingDigits()) {
			if (nationalPhoneNumber &&
				nationalPhoneNumber.search(metadata.leadingDigits()) === 0) {
				return country
			}
		}
		// Else perform full validation with all of those
		// fixed-line/mobile/etc regular expressions.
		else if (getNumberType({ phone: nationalPhoneNumber, country }, undefined, metadata.metadata)) {
			// When multiple countries share the same "country calling code",
			// type patterns aren't guaranteed to be unique among them.
			// For example, both `US` and `CA` have the same pattern for `toll_free` numbers.
			// https://gitlab.com/catamphetamine/libphonenumber-js/-/issues/103#note_1417147572
			//
			// That means that this `if` condition could be `true` for multiple countries from the list.
			// Currently, it just returns the first one, which is also the "main" country for the "country calling code".
			// In an example with `toll_free` numbers above, `"US"` would be returned even though
			// it could as well be `"CA"`.
			//
			// There was also a time when this attempted to be overly smart
			// and kept track of all such multiple matching countries
			// and then picked the one that matched the `defaultCountry`, if provided.
			// For example, with `toll_free` numbers above, and with `defaultCountry: "CA"`,
			// it would've returned `"CA"` instead of `"US"`.
			// Later it turned out that such "overly smart" behavior turned out to be just confusing,
			// so this "overly smart" country detection was reverted to returning the "main" country
			// for the "country calling code".
			// https://gitlab.com/catamphetamine/libphonenumber-js/-/issues/154
			//
			return country
			//
			// The "overly smart" behavior code:
			//
			// if (defaultCountry) {
			// 	if (country === defaultCountry) {
			// 		return country
			// 	} else {
			// 		matchingCountries.push(country)
			// 	}
			// } else {
			// 	return country
			// }
		}
	}

	// // Return the first ("main") one of the `matchingCountries`.
	// if (matchingCountries.length > 0) {
	// 	return matchingCountries[0]
	// }
}