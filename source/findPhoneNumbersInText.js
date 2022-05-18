import findNumbers from './findNumbers.js'

export default function findPhoneNumbersInText(text, defaultCountry, options, metadata) {
	const args = getArguments(defaultCountry, options, metadata)
	return findNumbers(text, args.options, args.metadata)
}

export function getArguments(defaultCountry, options, metadata) {
	if (metadata) {
		if (defaultCountry) {
			options = {
				...options,
				defaultCountry
			}
		}
	} else {
		if (options) {
			metadata = options
			if (defaultCountry) {
				if (is_object(defaultCountry)) {
					options = defaultCountry
				} else {
					options = { defaultCountry }
				}
			} else {
				options = undefined
			}
		} else {
			metadata = defaultCountry
			options = undefined
		}
	}
	return {
		options: {
			...options,
			v2: true
		},
		metadata
	}
}

// Babel transforms `typeof` into some "branches"
// so istanbul will show this as "branch not covered".
/* istanbul ignore next */
const is_object = _ => typeof _ === 'object'