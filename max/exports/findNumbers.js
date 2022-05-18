import { withMetadata } from '../metadata.js'
import { findNumbers as _findNumbers } from '../../core/index.js'

export function findNumbers() {
	return withMetadata(_findNumbers, arguments)
}