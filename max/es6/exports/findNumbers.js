import withMetadataArgument from './withMetadataArgument.js'
import { findNumbers as _findNumbers } from '../../../core/es6/index.js'

export function findNumbers() {
	return withMetadataArgument(_findNumbers, arguments)
}