import { withMetadata } from '../metadata'
import { isValidPhoneNumber as _isValidPhoneNumber } from '../../core/index'

export function isValidPhoneNumber() {
	return withMetadata(_isValidPhoneNumber, arguments)
}