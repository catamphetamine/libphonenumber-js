import parseNumber from './parse_'

export default function parsePhoneNumber(text, defaultCountry, metadata) {
	if (isObject(defaultCountry)) {
		metadata = defaultCountry
		defaultCountry = undefined
	}
	return parseNumber(text, { defaultCountry, v2: true }, metadata)
}

// so istanbul will show this as "branch not covered".
/* istanbul ignore next */
const isObject = _ => typeof _ === 'object'