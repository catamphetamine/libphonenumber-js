import isValidNumber from './validate_'

/**
 * Checks if a given phone number is valid within a given region.
 *
 * The `country` argument is the country the number must belong to.
 * This is a stricter version of `isValidNumber(number, defaultCountry)`.
 * Though restricting a country might not be a good idea.
 * https://github.com/googlei18n/libphonenumber/blob/master/FAQ.md#when-should-i-use-isvalidnumberforregion
 */
export default function isValidNumberForRegion(input, country, options = {}, metadata)
{
	return input.country === country && isValidNumber(input, options, metadata)
}