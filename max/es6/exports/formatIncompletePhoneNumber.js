import withMetadataArgument from './withMetadataArgument.js'
import { formatIncompletePhoneNumber as _formatIncompletePhoneNumber } from '../../../core/es6/index.js'

export function formatIncompletePhoneNumber() {
	return withMetadataArgument(_formatIncompletePhoneNumber, arguments)
}