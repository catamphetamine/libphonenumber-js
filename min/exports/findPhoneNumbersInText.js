import { withMetadata } from '../metadata'
import { findPhoneNumbersInText as _findPhoneNumbersInText } from '../../core/index'

export function findPhoneNumbersInText() {
	return withMetadata(_findPhoneNumbersInText, arguments)
}