import AsYouType from './AsYouType'

/**
 * Formats a (possibly incomplete) phone number.
 * The phone number can be either in E.164 format
 * or in a form of national number digits.
 * @param {string} value - A possibly incomplete phone number. Either in E.164 format or in a form of national number digits.
 * @param {string?} country - Two-letter ("ISO 3166-1 alpha-2") country code.
 * @return {string} Formatted (possibly incomplete) phone number.
 */
export default function formatIncompletePhoneNumber(value, country, metadata) {
	if (!metadata) {
		metadata = country
		country = undefined
	}
	return new AsYouType(country, metadata).input(value)
}