import { sort_out_arguments } from './parsePhoneNumber'
import PhoneNumberMatcher from './PhoneNumberMatcher'

/**
 * @return ES6 `for ... of` iterator.
 */
export default function searchNumbers(arg_1, arg_2, arg_3, arg_4)
{
	const { text, options, metadata } = sort_out_arguments(arg_1, arg_2, arg_3, arg_4)

	const matcher = new PhoneNumberMatcher(text, options, metadata)

	return  {
		[Symbol.iterator]() {
			return {
	    		next: () => {
	    			if (matcher.hasNext()) {
						return {
							done: false,
							value: matcher.next()
						}
					}
					return {
						done: true
					}
	    		}
			}
		}
	}
}
