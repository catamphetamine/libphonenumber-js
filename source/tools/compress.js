export default function compress(input)
{
	const countries = {}

	for (const country_code of Object.keys(input.countries))
	{
		const country = input.countries[country_code]

		// When changing this array also change getters in `./metadata.js`
		const country_array =
		[
			country.phone_code,

			country.idd_prefix,

			country.national_number_pattern,

			country.possible_lengths,
			// country.possible_lengths_local,

			country.formats && country.formats.map((format) =>
			{
				// When changing this array also change getters in `./metadata.js`
				const format_array =
				[
					format.pattern,
					format.format,
					format.leading_digits_patterns,
					format.national_prefix_formatting_rule,
					format.national_prefix_is_optional_when_formatting,
					format.international_format
				]

				return trim_array(format_array)
			}),

			country.national_prefix,
			country.national_prefix_formatting_rule,
			country.national_prefix_for_parsing,
			country.national_prefix_transform_rule,
			country.national_prefix_is_optional_when_formatting,
			country.leading_digits
		]

		if (country.types)
		{
			const types_array =
			[
				// These are common
				country.types.fixed_line,
				country.types.mobile,
				country.types.toll_free,
				country.types.premium_rate,
				country.types.personal_number,

				// These are less common
				country.types.voice_mail,
				country.types.uan,
				country.types.pager,
				country.types.voip,
				country.types.shared_cost
			]
			.map((type) => type && trim_array
			([
				type.pattern,
				type.possible_lengths
				// type.possible_lengths_local
			]))

			country_array.push(trim_array(types_array))
		}
		else
		{
			country_array.push(null)
		}

		country_array.push(country.default_idd_prefix)

		country_array.push(country.ext)

		countries[country_code] = trim_array(country_array)
	}

	return {
		version: input.version,
		country_calling_codes: input.country_calling_codes,
		countries
	}
}

// Empty strings are not considered "empty".
function is_empty(value)
{
	return value === undefined
		|| value === null
		|| value === false
		|| (Array.isArray(value) && value.length === 0)
}

// Removes trailing empty values from an `array`
function trim_array(array)
{
	// First, trim any empty elements.
	while (array.length > 0 && is_empty(array[array.length - 1]))
	{
		array.pop()
	}

	// Then replace all remaining empty elements with `0`
	// and also `true` with `1`.
	return array.map((element) =>
	{
		if (is_empty(element)) {
			return 0
		}
		if (element === true) {
			return 1
		}
		return element
	})
}