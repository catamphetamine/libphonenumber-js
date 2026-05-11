import withMetadataArgument from './withMetadataArgument.js'
import { getExtPrefix as _getExtPrefix } from '../../../core/es6/index.js'

export function getExtPrefix() {
	return withMetadataArgument(_getExtPrefix, arguments)
}