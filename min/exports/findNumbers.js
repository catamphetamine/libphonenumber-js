import { withMetadata } from '../metadata'
import { findNumbers as _findNumbers } from '../../core/index'

export function findNumbers() {
	return withMetadata(_findNumbers, arguments)
}