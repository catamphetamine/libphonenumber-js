import { withMetadata } from '../min/metadata'

import _getNumberType from '../es6/getNumberType'

export function getNumberType() {
	return withMetadata(_getNumberType, arguments)
}
