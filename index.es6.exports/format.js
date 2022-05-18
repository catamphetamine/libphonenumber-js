import { withMetadata } from '../min/metadata.js'

import _format from '../es6/format.js'

export function format() {
	return withMetadata(_format, arguments)
}
