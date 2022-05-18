import metadata from '../min/metadata.js'

import { PhoneNumberSearch as _PhoneNumberSearch } from '../es6/findPhoneNumbers_.js'

export function PhoneNumberSearch(text, options) {
	_PhoneNumberSearch.call(this, text, options, metadata)
}

// Deprecated.
PhoneNumberSearch.prototype = Object.create(_PhoneNumberSearch.prototype, {})
PhoneNumberSearch.prototype.constructor = PhoneNumberSearch
