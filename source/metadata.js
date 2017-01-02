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
	return country_metadata[2] || []
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

export function get_format_leading_digits_patterns(format_array)
{
	return format_array[2] || []
}

export function get_format_national_prefix_formatting_rule(format_array, country_metadata)
{
	return format_array[3] || get_national_prefix_formatting_rule(country_metadata)
}

export function get_format_national_prefix_is_optional_when_formatting(format_array, country_metadata)
{
	return format_array[4] || get_national_prefix_is_optional_when_formatting(country_metadata)
}

export function get_format_national_prefix_is_mandatory_when_formatting(format_array, country_metadata)
{
	// National prefix is omitted if there's no national prefix formatting rule
	// set for this country, or when this rule is set but
	// national prefix is optional for this phone number format
	// (and it is not enforced explicitly)
	return get_format_national_prefix_formatting_rule(format_array, country_metadata) &&
		!get_format_national_prefix_is_optional_when_formatting(format_array, country_metadata)
}

export function get_format_international_format(format_array)
{
	return format_array[5] || get_format_format(format_array)
}

// Formatting information for regions which share
// a country calling code is contained by only one region
// for performance reasons. For example, for NANPA region
// ("North American Numbering Plan Administration",
//  which includes USA, Canada, Cayman Islands, Bahamas, etc)
// it will be contained in the metadata for `US`.
export function get_metadata_by_country_phone_code(country_phone_code, metadata)
{
	const country_code = metadata.country_phone_code_to_countries[country_phone_code][0]
	return metadata.countries[country_code]
}

export function get_types(country_metadata)
{
	return country_metadata[9]
}

function get_type(country_metadata, index)
{
	return get_types(country_metadata) ? get_types(country_metadata)[index] : undefined
}

export function get_type_fixed_line(country_metadata)
{
	return get_type(country_metadata, 0)
}

export function get_type_mobile(country_metadata)
{
	return get_type(country_metadata, 1)
}

export function get_type_toll_free(country_metadata)
{
	return get_type(country_metadata, 2)
}

export function get_type_premium_rate(country_metadata)
{
	return get_type(country_metadata, 3)
}

export function get_type_personal_number(country_metadata)
{
	return get_type(country_metadata, 4)
}

export function get_type_voice_mail(country_metadata)
{
	return get_type(country_metadata, 5)
}

export function get_type_uan(country_metadata)
{
	return get_type(country_metadata, 6)
}

export function get_type_pager(country_metadata)
{
	return get_type(country_metadata, 7)
}

export function get_type_voip(country_metadata)
{
	return get_type(country_metadata, 8)
}

export function get_type_shared_cost(country_metadata)
{
	return get_type(country_metadata, 9)
}