// Deprecated.

import { withMetadata } from '../min/metadata.js'

import _isValidNumber from '../es6/validate.js'

export function isValidNumber() {
	return withMetadata(_isValidNumber, arguments)
}
