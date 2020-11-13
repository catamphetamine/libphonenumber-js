import { withMetadata } from '../min/metadata'

import _isValidNumber from '../es6/validate'

export function isValidNumber() {
	return withMetadata(_isValidNumber, arguments)
}
