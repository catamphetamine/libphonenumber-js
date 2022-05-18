import { withMetadata } from '../metadata.js'
import { searchPhoneNumbersInText as _searchPhoneNumbersInText } from '../../core/index.js'

export function searchPhoneNumbersInText() {
	return withMetadata(_searchPhoneNumbersInText, arguments)
}