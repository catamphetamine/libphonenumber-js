import { withMetadata } from '../metadata.js'
import { validatePhoneNumberLength as _validatePhoneNumberLength } from '../../core/index.js'

export function validatePhoneNumberLength() {
	return withMetadata(_validatePhoneNumberLength, arguments)
}