import { withMetadata } from '../metadata'
import { searchNumbers as _searchNumbers } from '../../core/index'

export function searchNumbers() {
	return withMetadata(_searchNumbers, arguments)
}