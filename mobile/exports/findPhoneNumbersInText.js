import { withMetadata } from '../metadata.js'
import { findPhoneNumbersInText as _findPhoneNumbersInText } from '../../core/index.js'

export function findPhoneNumbersInText() {
	return withMetadata(_findPhoneNumbersInText, arguments)
}