import withMetadataArgument from '../min/exports/withMetadataArgument.js'

import _format from '../es6/format.js'

export function format() {
	return withMetadataArgument(_format, arguments)
}
