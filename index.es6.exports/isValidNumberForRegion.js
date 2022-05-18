import { withMetadata } from '../min/metadata.js'

import _isValidNumberForRegion from '../es6/isValidNumberForRegion.js'

export function isValidNumberForRegion() {
	return withMetadata(_isValidNumberForRegion, arguments)
}
