import { withMetadata } from '../metadata'
import { getExtPrefix as _getExtPrefix } from '../../core/index'

export function getExtPrefix() {
	return withMetadata(_getExtPrefix, arguments)
}