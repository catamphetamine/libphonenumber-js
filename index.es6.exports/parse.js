import { withMetadata } from '../min/metadata.js'

import _parse from '../es6/parse.js'

export function parse() {
	return withMetadata(_parse, arguments)
}
