import _formatNumber from '../format.js'
import parse from '../parse.js'
import isObject from '../helpers/isObject.js'

export default function formatNumber() {
	const {
		input,
		format,
		options,
		metadata
	} = normalizeArguments(arguments)

	return _formatNumber(input, format, options, metadata)
}

// Sort out arguments
function normalizeArguments(args)
{
	// This line of code appeared to not work correctly with `babel`/`istanbul`:
	// for some weird reason, it caused coverage less than 100%.
	// That's because `babel`/`istanbul`, for some weird reason,
	// apparently doesn't know how to properly exclude Babel polyfills from code coverage.
	//
	// const [arg_1, arg_2, arg_3, arg_4, arg_5] = Array.prototype.slice.call(args)

	const arg_1 = args[0]
	const arg_2 = args[1]
	const arg_3 = args[2]
	const arg_4 = args[3]
	const arg_5 = args[4]

	let input
	let format
	let options
	let metadata

	// Sort out arguments.

	// If the phone number is passed as a string.
	// `format('8005553535', ...)`.
	if (typeof arg_1 === 'string')
	{
		// If country code is supplied.
		// `format('8005553535', 'RU', 'NATIONAL', [options], metadata)`.
		if (typeof arg_3 === 'string')
		{
			format = arg_3

			if (arg_5)
			{
				options  = arg_4
				metadata = arg_5
			}
			else
			{
				metadata = arg_4
			}

			input = parse(arg_1, { defaultCountry: arg_2, extended: true }, metadata)
		}
		// Just an international phone number is supplied
		// `format('+78005553535', 'NATIONAL', [options], metadata)`.
		else
		{
			if (typeof arg_2 !== 'string')
			{
				throw new Error('`format` argument not passed to `formatNumber(number, format)`')
			}

			format = arg_2

			if (arg_4)
			{
				options  = arg_3
				metadata = arg_4
			}
			else
			{
				metadata = arg_3
			}

			input = parse(arg_1, { extended: true }, metadata)
		}
	}
	// If the phone number is passed as a parsed number object.
	// `format({ phone: '8005553535', country: 'RU' }, 'NATIONAL', [options], metadata)`.
	else if (isObject(arg_1))
	{
		input  = arg_1
		format = arg_2

		if (arg_4)
		{
			options  = arg_3
			metadata = arg_4
		}
		else
		{
			metadata = arg_3
		}
	}
	else throw new TypeError('A phone number must either be a string or an object of shape { phone, [country] }.')

	// Legacy lowercase formats.
	if (format === 'International') {
		format = 'INTERNATIONAL'
	} else if (format === 'National') {
		format = 'NATIONAL'
	}

	return {
		input,
		format,
		options,
		metadata
	}
}