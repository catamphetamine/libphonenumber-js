import { withMetadata } from '../min/metadata'

import _findPhoneNumbers from '../es6/findPhoneNumbers'

export function findPhoneNumbers() {
	return withMetadata(_findPhoneNumbers, arguments)
}
