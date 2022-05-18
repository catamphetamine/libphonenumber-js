import { withMetadata } from '../min/metadata.js'

import { searchPhoneNumbers as _searchPhoneNumbers } from '../es6/findPhoneNumbers.js'

export function searchPhoneNumbers() {
	return withMetadata(_searchPhoneNumbers, arguments)
}
