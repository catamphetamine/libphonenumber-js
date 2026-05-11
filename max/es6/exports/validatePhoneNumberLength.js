import withMetadataArgument from './withMetadataArgument.js'
import { validatePhoneNumberLength as _validatePhoneNumberLength } from '../../../core/es6/index.js'

export function validatePhoneNumberLength() {
	return withMetadataArgument(_validatePhoneNumberLength, arguments)
}