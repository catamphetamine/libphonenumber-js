import { withMetadata } from '../metadata.js'
import { formatIncompletePhoneNumber as _formatIncompletePhoneNumber } from '../../core/index.js'

export function formatIncompletePhoneNumber() {
	return withMetadata(_formatIncompletePhoneNumber, arguments)
}