import { withMetadata } from '../min/metadata'

import _parse from '../es6/parse'

export function parse() {
	return withMetadata(_parse, arguments)
}
