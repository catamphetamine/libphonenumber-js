import { withMetadata } from '../min/metadata'

import _format from '../es6/format'

export function format() {
	return withMetadata(_format, arguments)
}
