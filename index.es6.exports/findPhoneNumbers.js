import withMetadataArgument from '../min/exports/withMetadataArgument.js'

import _findPhoneNumbers from '../es6/findPhoneNumbers.js'

export function findPhoneNumbers() {
	return withMetadataArgument(_findPhoneNumbers, arguments)
}
