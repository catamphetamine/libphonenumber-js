// This code hasn't been tested.

import { sort_out_arguments } from './findPhoneNumbers'
import PhoneNumberMatcher from './PhoneNumberMatcher'

export default function findNumbers(arg_1, arg_2, arg_3, arg_4)
{
	const { text, options, metadata } = sort_out_arguments(arg_1, arg_2, arg_3, arg_4)

	const matcher = new PhoneNumberMatcher(text, options, metadata)

	const results = []
	while (matcher.hasNext()) {
		results.push(matcher.next())
	}
	return results
}