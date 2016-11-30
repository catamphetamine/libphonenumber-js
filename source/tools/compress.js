export default function compress(input)
{
	const countries = {}

	for (let country_code of Object.keys(input.countries))
	{
		const country = input.countries[country_code]

		// When changing this array also change getters in `./metadata.js`
		const country_array =
		[
			country.phone_code,
			country.national_number_pattern,

			country.formats.map((format) =>
			{
				// When changing this array also change getters in `./metadata.js`
				const format_array =
				[
					format.pattern,
					format.format,
					format.leading_digits_patterns,
					format.national_prefix_formatting_rule,
					format.national_prefix_optional_when_formatting,
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

			country_array.push(trim_array(types_array))
		}

		countries[country_code] = trim_array(country_array)
	}

	// const output =
	// [
	// 	input.country_phone_code_to_countries,
	// 	countries
	// ]

	const output =
	{
		country_phone_code_to_countries: input.country_phone_code_to_countries,
		countries
	}

	return output
}

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
	while (array.length > 0 && is_empty(array[array.length - 1]))
	{
		array.pop()
	}

	return array
}