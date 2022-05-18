import metadata from '../metadata.js'
import { PhoneNumberMatcher as _PhoneNumberMatcher } from '../../core/index.js'

export function PhoneNumberMatcher(text, options) {
	return _PhoneNumberMatcher.call(this, text, options, metadata)
}
PhoneNumberMatcher.prototype = Object.create(_PhoneNumberMatcher.prototype, {})
PhoneNumberMatcher.prototype.constructor = PhoneNumberMatcher
