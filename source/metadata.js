import compare from 'semver-compare'

// Added "possibleLengths" and renamed
// "country_phone_code_to_countries" to "country_calling_codes".
const V2 = '1.0.18'

// Added "idd_prefix" and "default_idd_prefix".
const V3 = '1.2.0'

export default class Metadata
{
	constructor(metadata)
	{
		validateMetadata(metadata)

		this.metadata = metadata

		this.v1 = !metadata.version
		this.v2 = metadata.version !== undefined && compare(metadata.version, V3) === -1
		this.v3 = metadata.version !== undefined // && compare(metadata.version, V4) === -1
	}

	hasCountry(country)
	{
		return this.metadata.countries[country] !== undefined
	}

	country(country)
	{
		if (!country)
		{
			this._country = undefined
			this.country_metadata = undefined
			return this
		}

		if (!this.hasCountry(country))
		{
			throw new Error(`Unknown country: ${country}`)
		}

		this._country = country
		this.country_metadata = this.metadata.countries[country]
		return this
	}

	countryCallingCode()
	{
		return this.country_metadata[0]
	}

	IDDPrefix()
	{
		if (this.v1 || this.v2) return
		return this.country_metadata[1]
	}

	defaultIDDPrefix()
	{
		if (this.v1 || this.v2) return
		return this.country_metadata[12]
	}

	nationalNumberPattern()
	{
		if (this.v1 || this.v2) return this.country_metadata[1]
		return this.country_metadata[2]
	}

	possibleLengths()
	{
		if (this.v1) return
		return this.country_metadata[this.v2 ? 2 : 3]
	}

	formats()
	{
		const formats = this.country_metadata[this.v1 ? 2 : this.v2 ? 3 : 4] || []
		return formats.map(_ => new Format(_, this))
	}

	nationalPrefix()
	{
		return this.country_metadata[this.v1 ? 3 : this.v2 ? 4 : 5]
	}

	nationalPrefixFormattingRule()
	{
		return this.country_metadata[this.v1 ? 4 : this.v2 ? 5 : 6]
	}

	nationalPrefixForParsing()
	{
		// If `national_prefix_for_parsing` is not set explicitly,
		// then infer it from `national_prefix` (if any)
		return this.country_metadata[this.v1 ? 5 : this.v2 ? 6 : 7] || this.nationalPrefix()
	}

	nationalPrefixTransformRule()
	{
		return this.country_metadata[this.v1 ? 6 : this.v2 ? 7 : 8]
	}

	nationalPrefixIsOptionalWhenFormatting()
	{
		return this.country_metadata[this.v1 ? 7 : this.v2 ? 8 : 9]
	}

	leadingDigits()
	{
		return this.country_metadata[this.v1 ? 8 : this.v2 ? 9 : 10]
	}

	types()
	{
		return this.country_metadata[this.v1 ? 9 : this.v2 ? 10 : 11]
	}

	hasTypes()
	{
		return this.types() !== undefined
	}

	type(type)
	{
		if (this.hasTypes() && getType(this.types(), type))
		{
			return new Type(getType(this.types(), type), this)
		}
	}

	countryCallingCodes()
	{
		if (this.v1) return this.metadata.country_phone_code_to_countries
		return this.metadata.country_calling_codes
	}

	// Formatting information for regions which share
	// a country calling code is contained by only one region
	// for performance reasons. For example, for NANPA region
	// ("North American Numbering Plan Administration",
	//  which includes USA, Canada, Cayman Islands, Bahamas, etc)
	// it will be contained in the metadata for `US`.
	//
	// `country_calling_code` is always valid.
	// But the actual country may not necessarily be part of the metadata.
	//
	chooseCountryByCountryCallingCode(country_calling_code)
	{
		const country = this.countryCallingCodes()[country_calling_code][0]

		// Do not want to test this case.
		// (custom metadata, not all countries).
		/* istanbul ignore else */
		if (this.hasCountry(country))
		{
			this.country(country)
		}
	}

	selectedCountry()
	{
		return this._country
	}
}

class Format
{
	constructor(format, metadata)
	{
		this._format = format
		this.metadata = metadata
	}

	pattern()
	{
		return this._format[0]
	}

	format()
	{
		return this._format[1]
	}

	leadingDigitsPatterns()
	{
		return this._format[2] || []
	}

	nationalPrefixFormattingRule()
	{
		return this._format[3] || this.metadata.nationalPrefixFormattingRule()
	}

	nationalPrefixIsOptionalWhenFormatting()
	{
		return this._format[4] || this.metadata.nationalPrefixIsOptionalWhenFormatting()
	}

	nationalPrefixIsMandatoryWhenFormatting()
	{
		// National prefix is omitted if there's no national prefix formatting rule
		// set for this country, or when the national prefix formatting rule
		// contains no national prefix itself, or when this rule is set but
		// national prefix is optional for this phone number format
		// (and it is not enforced explicitly)
		return this.nationalPrefixFormattingRule() &&
			// Check that national prefix formatting rule is not a dummy one.
			// Check that national prefix formatting rule actually has national prefix digit(s).
			this.usesNationalPrefix() &&
			// Or maybe national prefix is optional for this format
			!this.nationalPrefixIsOptionalWhenFormatting()
	}

	// Checks whether national prefix formatting rule contains national prefix
	usesNationalPrefix()
	{
		// Check that national prefix formatting rule is not a dummy one
		return this.nationalPrefixFormattingRule() !== '$1' &&
			// Check that national prefix formatting rule actually has national prefix digit(s)
			/\d/.test(this.nationalPrefixFormattingRule().replace('$1', ''))
	}

	internationalFormat()
	{
		return this._format[5] || this.format()
	}
}

class Type
{
	constructor(type, metadata)
	{
		this.type = type
		this.metadata = metadata
	}

	pattern()
	{
		if (this.metadata.v1) return this.type
		return this.type[0]
	}

	possibleLengths()
	{
		if (this.metadata.v1) return
		return this.type[1] || this.metadata.possibleLengths()
	}
}

function getType(types, type)
{
	switch (type)
	{
		case 'FIXED_LINE':
			return types[0]
		case 'MOBILE':
			return types[1]
		case 'TOLL_FREE':
			return types[2]
		case 'PREMIUM_RATE':
			return types[3]
		case 'PERSONAL_NUMBER':
			return types[4]
		case 'VOICEMAIL':
			return types[5]
		case 'UAN':
			return types[6]
		case 'PAGER':
			return types[7]
		case 'VOIP':
			return types[8]
		case 'SHARED_COST':
			return types[9]
	}
}

export function validateMetadata(metadata)
{
	if (!metadata)
	{
		throw new Error('[libphonenumber-js] `metadata` argument not passed. Check your arguments.')
	}

	// `country_phone_code_to_countries` was renamed to
	// `country_calling_codes` in `1.0.18`.
	if
	(
		!is_object(metadata) ||
		!is_object(metadata.countries) ||
		(!is_object(metadata.country_calling_codes) && !is_object(metadata.country_phone_code_to_countries))
	)
	{
		throw new Error(`[libphonenumber-js] \`metadata\` argument was passed but it's not a valid metadata. Must be an object having \`.countries\` and \`.country_calling_codes\` child object properties. Got ${is_object(metadata) ? 'an object of shape: { ' + Object.keys(metadata).join(', ') + ' }' : 'a ' + type_of(metadata) + ': ' + metadata}.`)
	}
}

// Babel transforms `typeof` into some "branches"
// so istanbul will show this as "branch not covered".
/* istanbul ignore next */
const is_object = _ => typeof _ === 'object'

// Babel transforms `typeof` into some "branches"
// so istanbul will show this as "branch not covered".
/* istanbul ignore next */
const type_of = _ => typeof _