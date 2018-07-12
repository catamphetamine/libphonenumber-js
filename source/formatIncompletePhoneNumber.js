import AsYouType from './AsYouType'

/**
 * Formats a (possibly incomplete) phone number.
 * The phone number can be either in E.164 format
 * or in a form of national number digits.
 * @param {string} value - A possibly incomplete phone number. Either in E.164 format or in a form of national number digits.
 * @param {string?} country - Two-letter ("ISO 3166-1 alpha-2") country code.
 * @return {object} `{ text : string, template : string }`. `text` is the formatted `value`. `template` is `text` where all characters of `value` are replaced with `x`-es.
 */
export default function formatIncompletePhoneNumber(value, country, metadata, options)
{
	// "As you type" formatter.
	const formatter = new AsYouType(country, metadata)

	// Format the number.
	const number = formatter.input(value)

	// Return the formatting template if requested.
	if (options && options.template)
	{
		return { number, template: formatter.template }
	}

	return number
}