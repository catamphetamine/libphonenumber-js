import parseNumber from './parse_'

export default function parsePhoneNumber(arg_1, arg_2, arg_3, arg_4) {
	const { text, options, metadata } = normalizeArguments(arg_1, arg_2, arg_3, arg_4)
	return parseNumber(text, { ...options, v2: true }, metadata)
}

export function normalizeArguments(arg_1, arg_2, arg_3, arg_4)
{
	let text
	let options
	let metadata

	// If the phone number is passed as a string.
	// `parsePhoneNumber('88005553535', ...)`.
	if (typeof arg_1 === 'string') {
		text = arg_1
	}
	else throw new TypeError('A text for parsing must be a string.')

	// If "default country" argument is being passed then move it to `options`.
	// `parsePhoneNumber('88005553535', 'RU', [options], metadata)`.
	if (!arg_2 || typeof arg_2 === 'string')
	{
		if (arg_4) {
			options = arg_3
			metadata = arg_4
		} else {
			options = undefined
			metadata = arg_3
		}

		if (arg_2) {
			options = { defaultCountry: arg_2, ...options }
		}
	}
	// `parsePhoneNumber('+78005553535', [options], metadata)`.
	else if (isObject(arg_2))
	{
		if (arg_3) {
			options  = arg_2
			metadata = arg_3
		} else {
			metadata = arg_2
		}
	}
	else throw new Error(`Invalid second argument: ${arg_2}`)

	return {
		text,
		options,
		metadata
	}
}

// Otherwise istanbul would show this as "branch not covered".
/* istanbul ignore next */
const isObject = _ => typeof _ === 'object'