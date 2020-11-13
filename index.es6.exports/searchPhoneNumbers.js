import { withMetadata } from '../min/metadata'

import { searchPhoneNumbers as _searchPhoneNumbers } from '../es6/findPhoneNumbers'

export function searchPhoneNumbers() {
	return withMetadata(_searchPhoneNumbers, arguments)
}
