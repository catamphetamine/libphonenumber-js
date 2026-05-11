import withMetadataArgument from './withMetadataArgument.js'
import { searchNumbers as _searchNumbers } from '../../../core/es6/index.js'

export function searchNumbers() {
	return withMetadataArgument(_searchNumbers, arguments)
}