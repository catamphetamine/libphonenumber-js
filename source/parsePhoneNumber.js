import PhoneNumber from './PhoneNumber'
import parse from './parse'

export default function parsePhoneNumber(text, defaultCountry, metadata) {
	if (isObject(defaultCountry)) {
		metadata = defaultCountry
		defaultCountry = undefined
	}
	return parse(text, { defaultCountry, v2: true }, metadata)
}

// so istanbul will show this as "branch not covered".
/* istanbul ignore next */
const isObject = _ => typeof _ === 'object'