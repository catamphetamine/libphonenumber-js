import isViablePhoneNumber from './helpers/isViablePhoneNumber'
import _getNumberType from './helpers/getNumberType'
import parse from './parse_'

// Finds out national phone number type (fixed line, mobile, etc)
export default function getNumberType()
{
	const { input, options, metadata } = normalizeArguments(arguments)
	return _getNumberType(input, options, metadata)
}

// Sort out arguments
export function normalizeArguments(args)
{
	const [arg_1, arg_2, arg_3, arg_4] = Array.prototype.slice.call(args)

	let input
	let options = {}
	let metadata

	// If the phone number is passed as a string.
	// `getNumberType('88005553535', ...)`.
	if (typeof arg_1 === 'string')
	{
		// If "default country" argument is being passed
		// then convert it to an `options` object.
		// `getNumberType('88005553535', 'RU', metadata)`.
		if (typeof arg_2 !== 'object')
		{
			if (arg_4)
			{
				options = arg_3
				metadata = arg_4
			}
			else
			{
				metadata = arg_3
			}

			// `parse` extracts phone numbers from raw text,
			// therefore it will cut off all "garbage" characters,
			// while this `validate` function needs to verify
			// that the phone number contains no "garbage"
			// therefore the explicit `isViablePhoneNumber` check.
			if (isViablePhoneNumber(arg_1))
			{
				input = parse(arg_1, { defaultCountry: arg_2 }, metadata)
			}
			else
			{
				input = {}
			}
		}
		// No "resrict country" argument is being passed.
		// International phone number is passed.
		// `getNumberType('+78005553535', metadata)`.
		else
		{
			if (arg_3)
			{
				options = arg_2
				metadata = arg_3
			}
			else
			{
				metadata = arg_2
			}

			// `parse` extracts phone numbers from raw text,
			// therefore it will cut off all "garbage" characters,
			// while this `validate` function needs to verify
			// that the phone number contains no "garbage"
			// therefore the explicit `isViablePhoneNumber` check.
			if (isViablePhoneNumber(arg_1))
			{
				input = parse(arg_1, undefined, metadata)
			}
			else
			{
				input = {}
			}
		}
	}
	// If the phone number is passed as a parsed phone number.
	// `getNumberType({ phone: '88005553535', country: 'RU' }, ...)`.
	else if (is_object(arg_1))
	{
		input = arg_1

		if (arg_3)
		{
			options = arg_2
			metadata = arg_3
		}
		else
		{
			metadata = arg_2
		}
	}
	else throw new TypeError('A phone number must either be a string or an object of shape { phone, [country] }.')

	return {
		input,
		options,
		metadata
	}
}

// Babel transforms `typeof` into some "branches"
// so istanbul will show this as "branch not covered".
/* istanbul ignore next */
const is_object = _ => typeof _ === 'object'