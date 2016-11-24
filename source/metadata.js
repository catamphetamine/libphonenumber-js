export function get_phone_code(country_metadata)
{
	return country_metadata[0]
}

export function get_national_number_pattern(country_metadata)
{
	return country_metadata[1]
}

export function get_formats(country_metadata)
{
	return country_metadata[2]
}

export function get_national_prefix(country_metadata)
{
	return country_metadata[3]
}

export function get_national_prefix_formatting_rule(country_metadata)
{
	return country_metadata[4]
}

export function get_national_prefix_for_parsing(country_metadata)
{
	let national_prefix_for_parsing = country_metadata[5]

	// If `national_prefix_for_parsing` is not set explicitly,
	// then infer it from `national_prefix` (if any)
	if (!national_prefix_for_parsing)
	{
		national_prefix_for_parsing = get_national_prefix(country_metadata)
	}

	return national_prefix_for_parsing
}

export function get_national_prefix_transform_rule(country_metadata)
{
	return country_metadata[6]
}

export function get_national_prefix_is_optional_when_formatting(country_metadata)
{
	return country_metadata[7]
}

export function get_leading_digits(country_metadata)
{
	return country_metadata[8]
}

export function get_format_pattern(format_array)
{
	return format_array[0]
}

export function get_format_format(format_array)
{
	return format_array[1]
}

export function get_format_leading_digits(format_array)
{
	return format_array[2]
}

export function get_format_national_prefix_formatting_rule(format_array, country_metadata)
{
	return format_array[3] || get_national_prefix_formatting_rule(country_metadata)
}

export function get_format_national_prefix_is_optional_when_formatting(format_array, country_metadata)
{
	return format_array[4] || get_national_prefix_is_optional_when_formatting(country_metadata)
}

export function get_format_international_format(format_array)
{
	return format_array[5] || get_format_format(format_array)
}