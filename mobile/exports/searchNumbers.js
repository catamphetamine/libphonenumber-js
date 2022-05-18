import { withMetadata } from '../metadata.js'
import { searchNumbers as _searchNumbers } from '../../core/index.js'

export function searchNumbers() {
	return withMetadata(_searchNumbers, arguments)
}