import { sort_out_arguments } from './findPhoneNumbers'
import PhoneNumberMatcher from './PhoneNumberMatcher'

export default function findNumbers(arg_1, arg_2, arg_3, arg_4)
{
	const { text, options, metadata } = sort_out_arguments(arg_1, arg_2, arg_3, arg_4)

	options.leniency = options.leniency || 'VALID'
	options.maxTries = options.maxTries || Number.MAX_SAFE_INTEGER

	// See `.hasNext()` and `.next()` methods of `PhoneNumberMatcher`.
	return new PhoneNumberMatcher
	(
		text,
		options.defaultCountry,
		options.leniency,
		options.maxTries
	)

	// const finder = findNumbers(text, 'US')
	// while (finder.hasNext()) {
	//   console.log(finder.next())
	// }
}