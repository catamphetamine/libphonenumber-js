import withMetadataArgument from '../min/exports/withMetadataArgument.js'

import _getNumberType from '../es6/getNumberType.js'

export function getNumberType() {
	return withMetadataArgument(_getNumberType, arguments)
}
