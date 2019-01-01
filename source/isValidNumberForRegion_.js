import isValidNumber from './validate_'

/**
 * Checks if a given phone number is valid within a given region.
 * Is just an alias for `phoneNumber.isValid() && phoneNumber.country === country`.
 * https://github.com/googlei18n/libphonenumber/blob/master/FAQ.md#when-should-i-use-isvalidnumberforregion
 */
export default function isValidNumberForRegion(input, country, options = {}, metadata)
{
	return input.country === country && isValidNumber(input, options, metadata)
}