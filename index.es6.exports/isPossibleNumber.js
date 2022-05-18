// Deprecated.

import { withMetadata } from '../min/metadata.js'

import _isPossibleNumber from '../es6/isPossibleNumber.js'

export function isPossibleNumber() {
	return withMetadata(_isPossibleNumber, arguments)
}
