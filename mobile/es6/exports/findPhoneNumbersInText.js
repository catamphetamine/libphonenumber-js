import withMetadataArgument from './withMetadataArgument.js'
import { findPhoneNumbersInText as _findPhoneNumbersInText } from '../../../core/es6/index.js'

export function findPhoneNumbersInText() {
	return withMetadataArgument(_findPhoneNumbersInText, arguments)
}