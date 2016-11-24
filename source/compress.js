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
					format.leading_digits,
					format.national_prefix_formatting_rule,
					format.national_prefix_optional_when_formatting,
					format.international_format
				]

				trim_array(format_array)

				return format_array
			}),

			country.national_prefix,
			country.national_prefix_formatting_rule,
			country.national_prefix_for_parsing,
			country.national_prefix_transform_rule,
			country.national_prefix_is_optional_when_formatting,
			country.leading_digits,
			country.is_main_country_for_phone_code
		]

		trim_array(country_array)

		countries[country_code] = country_array
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
	while (is_empty(array[array.length - 1]))
	{
		array.pop()
	}
}