import { withMetadata } from '../metadata'
import { validatePhoneNumberLength as _validatePhoneNumberLength } from '../../core/index'

export function validatePhoneNumberLength() {
	return withMetadata(_validatePhoneNumberLength, arguments)
}