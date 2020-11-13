import { withMetadata } from '../min/metadata'

import _isPossibleNumber from '../es6/isPossibleNumber'

export function isPossibleNumber() {
	return withMetadata(_isPossibleNumber, arguments)
}
