import { withMetadata } from '../metadata.js'
import { getExtPrefix as _getExtPrefix } from '../../core/index.js'

export function getExtPrefix() {
	return withMetadata(_getExtPrefix, arguments)
}