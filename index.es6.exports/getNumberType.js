import { withMetadata } from '../min/metadata.js'

import _getNumberType from '../es6/getNumberType.js'

export function getNumberType() {
	return withMetadata(_getNumberType, arguments)
}
