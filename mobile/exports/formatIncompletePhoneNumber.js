import { withMetadata } from '../metadata'
import { formatIncompletePhoneNumber as _formatIncompletePhoneNumber } from '../../core/index'

export function formatIncompletePhoneNumber() {
	return withMetadata(_formatIncompletePhoneNumber, arguments)
}