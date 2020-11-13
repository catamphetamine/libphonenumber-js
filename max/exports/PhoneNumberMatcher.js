import metadata from '../metadata'
import { PhoneNumberMatcher as _PhoneNumberMatcher } from '../../core/index'

export function PhoneNumberMatcher(text, options) {
	return _PhoneNumberMatcher.call(this, text, options, metadata)
}
PhoneNumberMatcher.prototype = Object.create(_PhoneNumberMatcher.prototype, {})
PhoneNumberMatcher.prototype.constructor = PhoneNumberMatcher
