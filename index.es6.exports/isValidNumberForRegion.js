import { withMetadata } from '../min/metadata'

import _isValidNumberForRegion from '../es6/isValidNumberForRegion'

export function isValidNumberForRegion() {
	return withMetadata(_isValidNumberForRegion, arguments)
}
