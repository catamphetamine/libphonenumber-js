import { withMetadata } from '../min/metadata.js'

import _findPhoneNumbers from '../es6/findPhoneNumbers.js'

export function findPhoneNumbers() {
	return withMetadata(_findPhoneNumbers, arguments)
}
