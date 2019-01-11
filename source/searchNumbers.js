import { normalizeArguments } from './parsePhoneNumber'
import PhoneNumberMatcher from './PhoneNumberMatcher'

/**
 * @return ES6 `for ... of` iterator.
 */
export default function searchNumbers()
{
	const { text, options, metadata } = normalizeArguments(arguments)

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
